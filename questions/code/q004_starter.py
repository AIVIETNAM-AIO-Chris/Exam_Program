from nn import Model
from nn.layers import Linear
from nn.activations import ReLU, Softmax
from nn.optim import SGD
import numpy as np

samples = 1000
features = 728
num_class = 10

X = np.random.rand(samples, features)
labels = np.random.randint(0, num_class, size=samples)
Y = np.eye(num_class)[labels]

# ===== DATA PROCESSING =====
# TODO: Scale dữ liệu X về khoảng phù hợp


# TODO: Chia dữ liệu thành tập train/test (80/20)


# ===== MODEL =====
model = Model(
    Linear(728, 512),
    ReLU(),
    Linear(512, 256),
    ReLU(),
    Linear(256, 10),
    Softmax()
)

optimizer = SGD(model.parameters(), lr=0.01)

# ===== TRAINING =====
epochs = 10

for epoch in range(epochs):
    # TODO: Xóa gradient cũ


    # TODO: Forward pass


    # TODO: Tính loss (Cross-Entropy)


    # TODO: Backward pass


    # TODO: Cập nhật trọng số bằng optimizer


    # TODO: In thông tin loss mỗi epoch
    pass
