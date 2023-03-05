import torch

class EMNet(torch.nn.Module):
    def __init__(self):
        super(EMNet, self).__init__()
        self.seq = torch.nn.Sequential(
            torch.nn.Linear(22, 10),
            torch.nn.Sigmoid(),
            torch.nn.Linear(10, 2),
            torch.nn.ReLU()
        )
    def forward(self, x):
        params = self.seq(x)
        mu, sigma = torch.tensor_split(params, params.shape[0], dim=0)

        return mu, (sigma+1)**2
