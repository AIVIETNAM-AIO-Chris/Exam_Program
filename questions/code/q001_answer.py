import numpy as np

def compute_bce(y_true, y_pred):
    """
    Tính Binary Cross Entropy
    Args:
    - y_true: True labels, có shape (batch_size, 1)
    - y_pred: Predicted probabilities, có shape (batch_size, 1)
    Returns:
    - bce: Binary Cross Entropy Loss, có shape (1,)
    """
    loss = np.mean(-(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred)))
    return loss