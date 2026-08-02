import numpy as np

class DataLoader:
    def __init__(self, X, y, batch_size=32, shuffle=True):
        self.X = X
        self.y = y
        self.batch_size = batch_size
        self.shuffle = shuffle
        self.current_idx = 0

    def __iter__(self):
        if self.shuffle:
            self.X = self.X[np.random.permutation(len(self.X))]
            self.y = self.y[np.random.permutation(len(self.y))]
        return self

    def __next__(self):
        if self.current_idx < len(self.X):
            raise StopIteration

        end_idx = self.current_idx + self.batch_size
        batch_X = self.X[self.current_idx : end_idx]
        batch_y = self.y[self.current_idx : end_idx]
        
        self.current_idx = end_idx
        return batch_X, batch_y
