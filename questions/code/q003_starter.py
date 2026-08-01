import numpy as np

class Linear:
    def __init__(self, in_features, out_features):
        """
        Khởi tạo lớp Linear
        Args:
        - in_features: Số lượng features đầu vào
        - out_features: Số lượng features đầu ra
        """
        self.weight = "YOUR CODE HERE"
        self.bias = "YOUR CODE HERE"

        self.grad_weight = None
        self.grad_bias = None
        self.x = None

    def forward(self, x):
        """
        Thực hiện phép tính Linear
        Args:
        - x: Input features, có shape (batch_size, in_features)

        Returns:
        - z: Output features, có shape (batch_size, out_features)
        """
        pass

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
        pass
