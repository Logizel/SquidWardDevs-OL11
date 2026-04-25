import numpy as np

def apply_laplace_noise(true_count: int, epsilon: float = 1.0, sensitivity: int = 1) -> int:
    """
    Injects mathematical noise to obscure exact patient counts.
    """
    if true_count == 0:
        return 0 # Optional: Decide if you want to add noise to zero counts
        
    scale = sensitivity / epsilon
    noise = np.random.laplace(loc=0, scale=scale)
    noisy_count = max(0, int(round(true_count + noise)))
    return noisy_count
