"""
Data cleaning, validation, and feature engineering for the UCI Student Performance dataset.
Generates: data/processed/students_clean.csv
"""

import os
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

BINARY_COLS = ["schoolsup", "famsup", "paid", "activities", "nursery", "higher", "internet", "romantic"]

def preprocess_data():
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    mat_path = os.path.join(RAW_DIR, "student-mat.csv")
    por_path = os.path.join(RAW_DIR, "student-por.csv")
    
    if not os.path.exists(mat_path) or not os.path.exists(por_path):
        raise FileNotFoundError("Raw data files not found. Run download_data.py first.")
        
    df_mat = pd.read_csv(mat_path, sep=";")
    df_por = pd.read_csv(por_path, sep=";")
    
    df_mat["subject"] = "math"
    df_por["subject"] = "portuguese"
    
    # Merge both files
    df = pd.concat([df_mat, df_por], ignore_index=True)
    initial_count = len(df)
    print(f"Loaded {len(df_mat)} math rows and {len(df_por)} portuguese rows. Total merged: {initial_count}")
    
    # Range validations
    assert (df["G1"].between(0, 20)).all(), "G1 out of bounds 0-20"
    assert (df["G2"].between(0, 20)).all(), "G2 out of bounds 0-20"
    assert (df["G3"].between(0, 20)).all(), "G3 out of bounds 0-20"
    assert (df["absences"] >= 0).all(), "Absences negative"
    assert (df["studytime"].between(1, 4)).all(), "studytime out of range 1-4"
    assert (df["failures"].between(0, 4)).all(), "failures out of range 0-4"
    
    # Convert binary yes/no columns to boolean or 1/0
    for col in BINARY_COLS:
        if col in df.columns:
            df[col] = df[col].map({"yes": 1, "no": 0, True: 1, False: 0}).fillna(0).astype(int)
            
    # Feature engineering
    # 1. parent_edu_avg: mean of Medu and Fedu
    df["parent_edu_avg"] = np.round((df["Medu"] + df["Fedu"]) / 2.0, 2)
    
    # 2. alcohol_avg: weighted Dalc (weekday x5) and Walc (weekend x2)
    df["alcohol_avg"] = np.round((df["Dalc"] * 5.0 + df["Walc"] * 2.0) / 7.0, 2)
    
    # 3. social_score: mean of freetime and goout
    df["social_score"] = np.round((df["freetime"] + df["goout"]) / 2.0, 2)
    
    # 4. grade_trend: G2 - G1
    df["grade_trend"] = df["G2"] - df["G1"]
    
    # Binary classification target: pass if G3 >= 10
    df["pass"] = (df["G3"] >= 10).astype(int)
    
    # Missing values check
    missing = df.isnull().sum().to_dict()
    total_missing = sum(missing.values())
    print(f"Data quality check: Total missing values = {total_missing}")
    
    # Document zero grades count
    zeros_count = int((df["G3"] == 0).sum())
    print(f"Students with G3 == 0: {zeros_count} ({zeros_count / len(df) * 100:.1f}%)")
    
    out_path = os.path.join(PROCESSED_DIR, "students_clean.csv")
    df.to_csv(out_path, index=False)
    print(f"Processed dataset written to {out_path} ({len(df)} rows, {df.shape[1]} columns)")
    return df

if __name__ == "__main__":
    preprocess_data()
