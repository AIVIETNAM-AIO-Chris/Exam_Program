import numpy as np

class Linear:
    def __init__(self, in_features, out_features):
        """
        Khởi tạo lớp Linear
        Args:
        - in_features: Số lượng features đầu vào
        - out_features: Số lượng features đầu ra
        """
        self.weight = np.random.randn(in_features, out_features) / np.sqrt(in_features)
        self.bias = np.zeros(out_features)

    def forward(self, x):
        """
        Thực hiện phép tính Linear
        Args:
        - x: Input features, có shape (batch_size, in_features)

        Returns:
        - z: Output features, có shape (batch_size, out_features)
        """
        return x @ self.weight + self.bias

    def backward(self, grad_z):
        """
        Tính toán gradient cho weight và bias
        Args:
        - grad_z: Gradient của hàm mất mát theo output z, có shape (batch_size, out_features)
        
        Returns:
        - grad_w: Gradient của hàm mất mát theo weight, có shape (in_features, out_features)
        - grad_b: Gradient của hàm mất mát theo bias, có shape (out_features)
        - grad_x: Gradient của hàm mất mát theo input x, có shape (batch_size, in_features)
        """
        self.grad_w = self.x.T @ grad_z
        self.grad_b = np.sum(grad_z, axis=0)
        self.grad_x = grad_z @ self.weight.T
        return self.grad_w, self.grad_b, self.grad_x
