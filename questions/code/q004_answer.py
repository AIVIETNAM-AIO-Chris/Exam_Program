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
# Scale dữ liệu X bằng Standardization
X_mean = np.mean(X, axis=0)
X_std = np.std(X, axis=0) + 1e-8  # Tránh chia cho 0
X = (X - X_mean) / X_std

# Chia dữ liệu thành tập train/test (80/20)
split = int(0.8 * samples)
X_train, X_test = X[:split], X[split:]
Y_train, Y_test = Y[:split], Y[split:]

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
    # Xóa gradient cũ
    optimizer.zero_grad()

    # Forward pass
    output = model.forward(X_train)

    # Tính loss (Cross-Entropy)
    loss = -np.sum(Y_train * np.log(output + 1e-9)) / len(Y_train)

    # Backward pass
    loss_grad = (output - Y_train) / len(Y_train)
    model.backward(loss_grad)

    # Cập nhật trọng số bằng optimizer
    optimizer.step()

    # In thông tin loss mỗi epoch
    print(f"Epoch {epoch + 1}/{epochs} - Loss: {loss:.4f}")
