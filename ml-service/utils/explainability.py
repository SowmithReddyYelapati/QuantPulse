import shap
import numpy as np

def explain_prediction(model, background_data, instance_data, feature_names):
    """
    Explain a prediction using SHAP for a scikit-learn compatible model (like Random Forest).
    background_data: A representative sample of the training data (scaled).
    instance_data: The scaled features for the current prediction.
    """
    try:
        # Use TreeExplainer for Random Forest
        explainer = shap.TreeExplainer(model)
        
        # Calculate SHAP values
        shap_values = explainer.shap_values(instance_data)
        
        # SHAP values might be a list (for classification) or array (for regression)
        if isinstance(shap_values, list):
            shap_values = shap_values[1] # Take positive class if classification, though we are doing regression
            
        if len(shap_values.shape) > 1 and shap_values.shape[0] == 1:
            shap_values = shap_values[0]
            
        # Create a dictionary mapping feature names to their SHAP values
        explanation = {}
        for i, name in enumerate(feature_names):
            explanation[name] = float(shap_values[i])
            
        # Sort by absolute impact
        sorted_explanation = dict(sorted(explanation.items(), key=lambda item: abs(item[1]), reverse=True))
        
        # Take top 5 for the UI
        top_5 = {k: sorted_explanation[k] for k in list(sorted_explanation.keys())[:5]}
        
        return top_5
    except Exception as e:
        print(f"Error computing SHAP values: {e}")
        return {}
