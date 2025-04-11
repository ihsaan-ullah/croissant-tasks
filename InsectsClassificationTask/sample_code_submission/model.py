from sklearn.ensemble import RandomForestClassifier


class Model:
    def __init__(self):
        """
        Initializes the Model with a simple classifier.
        """
        self.classifier = RandomForestClassifier(n_estimators=100, random_state=42)

    def fit(self, X_Train, Y_Train):
        """
        Fits the classifier using the training data.

        Args:
            X_Train (numpy.ndarray): Training images.
            Y_Train (numpy.ndarray): Corresponding labels.
        """
        print("\tTraining the model...")
        X_Train = self._preprocess(X_Train)
        self.classifier.fit(X_Train, Y_Train)
        print("\tModel training complete.")

    def predict(self, X_Test):
        """
        Predicts the labels for the test images.

        Args:
            X_Test (numpy.ndarray): Test images.

        Returns:
            numpy.ndarray: Predicted labels.
        """
        print("\tMaking predictions...")
        X_Test = self._preprocess(X_Test)
        return self.classifier.predict(X_Test)

    def _preprocess(self, X):
        """
        Preprocesses the image data by flattening each image.

        Args:
            X (numpy.ndarray): Image dataset.

        Returns:
            numpy.ndarray: Flattened image dataset.
        """
        return X.reshape(X.shape[0], -1)  # Flatten each image
