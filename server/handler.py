# Custom model handler for Torchserve

import torch
from ts.torch_handler.base_handler import BaseHandler
from torch.distributions import Normal
import numpy as np

feat_params = []
class ModelHandler(BaseHandler):
    """
    Custom model handler to provide inference capabilities for the 
    mixture density network with expectation maximization.
    """
    def initialize(self, context):
        """
        Initialize model. Runs at model loading time.
        Reads feature distributions from file.
        """
        BaseHandler.initialize(self, context)
        
        model_name = self.manifest["model"]["modelName"]

        # Setup feature distributions
        feat_dist_file = open(f"{model_name}_feat.txt", 'r')
        for line in feat_dist_file.readlines():
            lineSplit = line.split(", ")
            mu = float(lineSplit[0])
            sigma = float(lineSplit[1])
            feat_params.append((mu, sigma))
        feat_dist_file.close()

        self.initialized = True

    def preprocess(self, req):
        """
        Preprocess function to convert the request input to a tensor.

        Args :
            req : A list containing a dictionary [{'body': json_file}]

        Returns :
            tensor : input data for model
        """
        data = req[0].get('body')
        if data is None:
            data = req[0].get('data')
        input_array = data.get('input')

        # Check for nan
        for i in range(len(input_array)):
            if isinstance(input_array[i], str):
                input_array[i] = float('nan')

        print(input_array)
        
        return torch.as_tensor(input_array, device=self.device)

    def inference(self, model_input):
        """
        Predicts outcomes using the model and given input.

        Args :
            model_input : tensor
        
        Returns : 
            tensor : output
        """
        # Iterate over subset of possible y values: 0, 0.01, 0.02, ..., 1
        y_probs = []
        SAMPLES = 100
        for y in np.linspace(0, 1, 101):
            # Sample from feature distributions
            missing = torch.nonzero(torch.isnan(model_input))
            tot_samp = torch.zeros(1, 1).to(self.device)
            for i in range(SAMPLES):
                x_hat = model_input.clone()
                xmis = []

                #  First sample for each missing x
                for imis in missing:
                    mu, sigma = feat_params[imis.item()]
                    gen_x = Normal(mu, sigma).sample()
                    # Replace nan with sample
                    x_hat[imis] = gen_x
                    xmis.append(gen_x)

                # Run sampled x through NN
                mu_nn, sigma_nn = self.model.forward(x_hat)

                # Use sampled x to get p(y | x)
                dist_nn = Normal(mu_nn, sigma_nn)
                log_p_y_x = dist_nn.log_prob(torch.tensor(y).to(self.device))

                # Add to total of samples
                tot_samp = tot_samp + log_p_y_x

            res = torch.exp(tot_samp / SAMPLES)

            # Add result to output array
            y_probs.append((y, res.item()))

        return y_probs

    def postprocess(self, data):
        """
        Post-processing function to prep output for response.
        
        Args :
            data : list

        Returns
            list : output data
        """

        return [data]
