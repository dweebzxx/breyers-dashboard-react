#!/usr/bin/env python3
"""
Breyers Survey Dashboard — Pre-computation Script
==================================================
Reads the cleaned survey CSV, applies label mappings, computes all statistics,
and writes pre-computed JSON files to public/data/.

Usage
-----
    # Copy the CSV first:
    cp /path/to/breyers-survey-data-cleaned.csv scripts/data/
    # Then run:
    python scripts/precompute-stats.py

Output files
------------
public/data/survey.json                   — full respondent data (labelled)
public/data/labels.json                   — all label mappings
public/data/question-text.json            — survey question text
public/data/stats/overview.json           — N, concept distribution, means, T2B
public/data/stats/concept-performance.json — t-test results for all concept pairs
public/data/stats/regression-ols.json     — OLS regression by reference group
public/data/stats/regression-logit.json  — Logistic regression by reference group
public/data/stats/correlations.json       — Pearson correlation matrix
public/data/stats/price-sensitivity.json  — Price likelihood by concept & overall
public/data/stats/crosstabs-options.json  — Available cross-tab variable options
"""

from __future__ import annotations

import json
import math
import sys
from itertools import combinations
from pathlib import Path

import numpy as np
import pandas as pd
import statsmodels.api as sm
from scipy import stats

# ──────────────────────────────────────────────────────────────────────────────
# Paths
# ──────────────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
DATA_IN = SCRIPT_DIR / "data" / "breyers-survey-data-cleaned.csv"
DATA_OUT = REPO_ROOT / "public" / "data"
STATS_OUT = DATA_OUT / "stats"

DATA_OUT.mkdir(parents=True, exist_ok=True)
STATS_OUT.mkdir(parents=True, exist_ok=True)

# ──────────────────────────────────────────────────────────────────────────────
# Label mappings  (mirrors src/label_mappings.py in breyers-survey-dashboard)
# ──────────────────────────────────────────────────────────────────────────────

CONCEPT_LABEL = {
    1: "with higher protein",
    2: "with low or zero added sugar",
    3: "with higher protein and low or zero added sugar",
}

PURCHASE_FREQ = {1: "Weekly", 2: "2-3 times per month", 3: "Monthly", 4: "Less often"}

APPEAL = {
    1: "Not at all appealing",
    2: "Slightly appealing",
    3: "Moderately appealing",
    4: "Very appealing",
    5: "Extremely appealing",
}

PURCHASE_INTENT = {
    1: "Very unlikely",
    2: "Unlikely",
    3: "Neither likely nor unlikely",
    4: "Likely",
    5: "Very likely",
}

TOP2BOX = {0: "Bottom 3 Box", 1: "Top 2 Box (Likely/Very Likely)"}

REPLACEMENT = {
    1: "Replace your usual ice cream",
    2: "Be in addition to your usual ice cream",
    3: "Replace a different dessert",
    4: "Not sure",
}

WHAT_REPLACED = {
    1: "Regular Breyers ice cream",
    2: "Another ice cream brand (not Breyers)",
    3: "A better-for-you ice cream brand (e.g., Halo Top, Enlightened, Nick's)",
    4: "Another dessert (not ice cream)",
    5: "I would skip dessert altogether",
    6: "Not sure",
}

INTEREST_COMPARISON = {
    1: "Much less interested",
    2: "Somewhat less interested",
    3: "About the same",
    4: "Somewhat more interested",
    5: "Much more interested",
}

PURCHASE_LOCATION = {
    1: "Grocery store",
    2: "Club/wholesale store (e.g., Costco, Sam's)",
    3: "Online delivery",
    4: "Convenience store",
}

PRICE_LIKELIHOOD = {
    1: "Very unlikely",
    2: "Unlikely",
    3: "Neither likely nor unlikely",
    4: "Likely",
    5: "Very likely",
}

CLUB_STORE = {
    1: "Definitely would not",
    2: "Probably would not",
    3: "Might or might not",
    4: "Probably would",
    5: "Definitely would",
}

ONLINE_DELIVERY = {
    1: "Very unlikely",
    2: "Unlikely",
    3: "Neither likely nor unlikely",
    4: "Likely",
    5: "Very likely",
}

DIET_FOCUS = {1: "Limit sugar", 2: "Increase protein", 3: "Both", 4: "Neither"}

HOUSEHOLD_TYPE = {
    1: "Live alone",
    2: "Live with spouse/partner (no children)",
    3: "Live with spouse/partner and children under 18",
    4: "Live with children under 18 (single parent)",
    6: "Other",
}

AGE = {1: "18-24", 2: "25-34", 3: "35-44", 4: "45-54", 5: "55-64", 6: "65+"}

INCOME = {
    1: "Less than $25,000",
    2: "$25,000-$49,999",
    3: "$50,000-$74,999",
    4: "$75,000-$99,999",
    5: "$100,000-$149,999",
    6: "$150,000 or more",
    7: "Prefer not to say",
}

ATTR_IMPORTANCE = {
    1: "Taste",
    2: "Price",
    3: "Brand reputation",
    4: "Low/zero sugar",
    5: "High protein",
    6: "Short/clean ingredient list",
    7: "Low calorie content",
}

IMPORTANCE_SCALE = {
    1: "Not at all important",
    2: "Slightly important",
    3: "Moderately important",
    4: "Very important",
    5: "Extremely important",
}

BRANDS_BOUGHT = {
    1: "Breyers",
    2: "Ben & Jerry's",
    4: "Halo Top",
    5: "Enlightened",
    6: "Nick's",
    7: "Store brand / private label",
    8: "Local or regional brand",
}

TRADEOFF = {
    1: "Higher protein content",
    2: "Lower sugar content",
    3: "Neither - taste matters more",
}

ACTIVE_SEEKING = {
    1: "I actively look for low/zero sugar ice cream",
    2: "I actively look for high-protein ice cream",
    3: "I actively look for both",
    4: "Neither is a priority for me",
}

PRICE_POINTS = {
    "Q17a_Price399": "$3.99",
    "Q17b_Price499": "$4.99",
    "Q17c_Price599": "$5.99",
    "Q17d_Price699": "$6.99",
    "Q17e_Price799": "$7.99",
}

ALL_LABELS = {
    "CONCEPT_LABEL": {str(k): v for k, v in CONCEPT_LABEL.items()},
    "PURCHASE_FREQ": {str(k): v for k, v in PURCHASE_FREQ.items()},
    "APPEAL": {str(k): v for k, v in APPEAL.items()},
    "PURCHASE_INTENT": {str(k): v for k, v in PURCHASE_INTENT.items()},
    "TOP2BOX": {str(k): v for k, v in TOP2BOX.items()},
    "REPLACEMENT": {str(k): v for k, v in REPLACEMENT.items()},
    "WHAT_REPLACED": {str(k): v for k, v in WHAT_REPLACED.items()},
    "INTEREST_COMPARISON": {str(k): v for k, v in INTEREST_COMPARISON.items()},
    "PURCHASE_LOCATION": {str(k): v for k, v in PURCHASE_LOCATION.items()},
    "PRICE_LIKELIHOOD": {str(k): v for k, v in PRICE_LIKELIHOOD.items()},
    "CLUB_STORE": {str(k): v for k, v in CLUB_STORE.items()},
    "ONLINE_DELIVERY": {str(k): v for k, v in ONLINE_DELIVERY.items()},
    "DIET_FOCUS": {str(k): v for k, v in DIET_FOCUS.items()},
    "HOUSEHOLD_TYPE": {str(k): v for k, v in HOUSEHOLD_TYPE.items()},
    "AGE": {str(k): v for k, v in AGE.items()},
    "INCOME": {str(k): v for k, v in INCOME.items()},
    "ATTR_IMPORTANCE": {str(k): v for k, v in ATTR_IMPORTANCE.items()},
    "IMPORTANCE_SCALE": {str(k): v for k, v in IMPORTANCE_SCALE.items()},
    "BRANDS_BOUGHT": {str(k): v for k, v in BRANDS_BOUGHT.items()},
    "TRADEOFF": {str(k): v for k, v in TRADEOFF.items()},
    "ACTIVE_SEEKING": {str(k): v for k, v in ACTIVE_SEEKING.items()},
    "PRICE_POINTS": PRICE_POINTS,
}

# ──────────────────────────────────────────────────────────────────────────────
# Data loading
# ──────────────────────────────────────────────────────────────────────────────

NUMERIC_COLS = [
    "Q1_Consent", "Q2_PurchaseRecent", "Q3_DecisionRole", "Q4_PurchaseFreq",
    "Q5_UsualChannel", "Q8_AttrImportance_1", "Q8_AttrImportance_2",
    "Q8_AttrImportance_3", "Q8_AttrImportance_4", "Q8_AttrImportance_5",
    "Q8_AttrImportance_6", "Q8_AttrImportance_7", "Q8h_QualityCheck_Trap1",
    "Q9_Tradeoff", "Q10_ActiveSeeking", "Q11_Appeal", "Q12_PurchaseIntent",
    "Q13_Replacement", "Q13A_WhatReplaced", "Q14_InterestComparison",
    "Q15_AttentionCheck_1", "Q16_PurchaseLocation", "Q17a_Price399",
    "Q17b_Price499", "Q17c_Price599", "Q17d_Price699", "Q17e_Price799",
    "Q18_PriceTooExpensive", "Q19_ClubStore4Pack", "Q20_OnlineDelivery",
    "Q21_DietFocus", "Q22_HouseholdType", "Q23_Age", "Q24_Income", "ClaimCell",
]


def load_data() -> tuple[pd.DataFrame, dict[str, str]]:
    df_raw = pd.read_csv(DATA_IN, header=0)

    # Row 0 is the question-text row
    question_row = df_raw.iloc[0]
    question_text: dict[str, str] = {}
    for col in df_raw.columns:
        text = str(question_row[col])
        text = " ".join(text.split())
        text = text.replace("[Field-ConceptLabel]", "").strip().lstrip(": ")
        question_text[col] = text

    df = df_raw.iloc[1:].copy().reset_index(drop=True)

    for col in NUMERIC_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Derived: Top-2 Box Purchase Intent
    df["Top2Box_PI"] = (df["Q12_PurchaseIntent"] >= 4).astype(int)

    # Parsed brand boolean columns
    brand_codes = {
        "1": "Brand_Breyers",
        "2": "Brand_BenJerrys",
        "4": "Brand_HaloTop",
        "5": "Brand_Enlightened",
        "6": "Brand_Nicks",
        "7": "Brand_StorePrivate",
        "8": "Brand_LocalRegional",
    }
    for brand_col in brand_codes.values():
        df[brand_col] = False

    for idx, row in df.iterrows():
        brands_str = str(row.get("Q6_BrandsBought", ""))
        if brands_str and brands_str != "nan":
            for code in [b.strip() for b in brands_str.split(",")]:
                if code in brand_codes:
                    df.at[idx, brand_codes[code]] = True

    return df, question_text


# ──────────────────────────────────────────────────────────────────────────────
# JSON serialisation helpers
# ──────────────────────────────────────────────────────────────────────────────

def _safe(val):
    """Convert numpy / pandas scalars to plain Python; map NaN/inf to None."""
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        v = float(val)
        return None if (math.isnan(v) or math.isinf(v)) else v
    if isinstance(val, (np.bool_,)):
        return bool(val)
    if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
        return None
    return val


def _to_dict(obj) -> dict:
    """Recursively make an object JSON-serialisable."""
    if isinstance(obj, dict):
        return {str(k): _to_dict(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_to_dict(i) for i in obj]
    return _safe(obj)


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(_to_dict(data), fh, indent=2, ensure_ascii=False)
    print(f"  ✓ {path.relative_to(REPO_ROOT)}")


# ──────────────────────────────────────────────────────────────────────────────
# Statistics
# ──────────────────────────────────────────────────────────────────────────────

def run_ttest(
    df: pd.DataFrame,
    metric_col: str,
    group_col: str,
    g1_label: str,
    g2_label: str,
) -> dict:
    g1 = df.loc[df[group_col] == g1_label, metric_col].dropna()
    g2 = df.loc[df[group_col] == g2_label, metric_col].dropna()
    n1, n2 = len(g1), len(g2)

    if n1 < 2 or n2 < 2:
        return {
            "error": f"Insufficient data: n1={n1}, n2={n2}",
            "group1_mean": None, "group2_mean": None,
            "t_statistic": None, "p_value": None,
            "ci_low": None, "ci_high": None,
            "n1": n1, "n2": n2, "mean_diff": None,
        }

    t_stat, p_val = stats.ttest_ind(g1, g2, equal_var=False)
    mean1, mean2 = float(g1.mean()), float(g2.mean())
    mean_diff = mean1 - mean2

    se1 = float(g1.std(ddof=1)) / math.sqrt(n1)
    se2 = float(g2.std(ddof=1)) / math.sqrt(n2)
    se_diff = math.sqrt(se1**2 + se2**2)
    dof = (se1**2 + se2**2)**2 / ((se1**2)**2 / (n1 - 1) + (se2**2)**2 / (n2 - 1))
    t_crit = stats.t.ppf(0.975, df=dof)

    return {
        "group1_mean": round(mean1, 2),
        "group2_mean": round(mean2, 2),
        "t_statistic": round(float(t_stat), 3),
        "p_value": round(float(p_val), 4),
        "ci_low": round(mean_diff - t_crit * se_diff, 3),
        "ci_high": round(mean_diff + t_crit * se_diff, 3),
        "n1": int(n1),
        "n2": int(n2),
        "mean_diff": round(float(mean_diff), 3),
        "error": None,
    }


def _build_regression_data(
    df: pd.DataFrame,
    dv_col: str,
    iv_cols: list[str],
    reference_cell: int,
) -> tuple[pd.DataFrame, list[str]]:
    dummy_names = {
        1: {2: "ClaimCell_HighProtein", 3: "ClaimCell_Both"},
        2: {1: "ClaimCell_LowSugar", 3: "ClaimCell_Both"},
        3: {1: "ClaimCell_LowSugar", 2: "ClaimCell_HighProtein"},
    }
    cells_to_dummy = dummy_names[reference_cell]
    data = df[[dv_col] + iv_cols + ["ClaimCell"]].dropna().copy()
    for cell_code, dummy_col in cells_to_dummy.items():
        data[dummy_col] = (data["ClaimCell"] == cell_code).astype(int)
    return data, list(cells_to_dummy.values())


def run_ols(df: pd.DataFrame, reference_cell: int = 1) -> dict:
    iv_cols = [f"Q8_AttrImportance_{i}" for i in range(1, 8)]
    dv_col = "Q12_PurchaseIntent"
    data, dummy_cols = _build_regression_data(df, dv_col, iv_cols, reference_cell)
    predictor_cols = iv_cols + dummy_cols
    X = sm.add_constant(data[predictor_cols])
    y = data[dv_col]
    model = sm.OLS(y, X).fit()
    ci = model.conf_int()

    return {
        "model_type": "OLS",
        "n_obs": int(model.nobs),
        "r_squared": round(float(model.rsquared), 4),
        "adj_r_squared": round(float(model.rsquared_adj), 4),
        "f_statistic": round(float(model.fvalue), 3),
        "f_pvalue": round(float(model.f_pvalue), 4),
        "coefficients": {k: round(float(v), 4) for k, v in model.params.items()},
        "std_errors": {k: round(float(v), 4) for k, v in model.bse.items()},
        "p_values": {k: round(float(v), 4) for k, v in model.pvalues.items()},
        "conf_int_low": {k: round(float(ci.loc[k, 0]), 4) for k in ci.index},
        "conf_int_high": {k: round(float(ci.loc[k, 1]), 4) for k in ci.index},
        "predictor_cols": predictor_cols,
        "reference_cell": reference_cell,
        "error": None,
    }


def run_logit(df: pd.DataFrame, reference_cell: int = 1) -> dict:
    iv_cols = [f"Q8_AttrImportance_{i}" for i in range(1, 8)]
    dv_col = "Top2Box_PI"
    data, dummy_cols = _build_regression_data(df, dv_col, iv_cols, reference_cell)
    predictor_cols = iv_cols + dummy_cols
    X = sm.add_constant(data[predictor_cols])
    y = data[dv_col]
    model = sm.Logit(y, X).fit(disp=0)
    ci = model.conf_int()
    odds_ratios = np.exp(model.params)
    ci_or_low = np.exp(ci[0])
    ci_or_high = np.exp(ci[1])

    return {
        "model_type": "Logit",
        "n_obs": int(model.nobs),
        "pseudo_r_squared": round(float(model.prsquared), 4),
        "llr_pvalue": round(float(model.llr_pvalue), 4),
        "coefficients": {k: round(float(v), 4) for k, v in model.params.items()},
        "odds_ratios": {k: round(float(v), 4) for k, v in odds_ratios.items()},
        "std_errors": {k: round(float(v), 4) for k, v in model.bse.items()},
        "p_values": {k: round(float(v), 4) for k, v in model.pvalues.items()},
        "conf_int_low": {k: round(float(ci.loc[k, 0]), 4) for k in ci.index},
        "conf_int_high": {k: round(float(ci.loc[k, 1]), 4) for k in ci.index},
        "or_ci_low": {k: round(float(ci_or_low[k]), 4) for k in ci_or_low.index},
        "or_ci_high": {k: round(float(ci_or_high[k]), 4) for k in ci_or_high.index},
        "predictor_cols": predictor_cols,
        "reference_cell": reference_cell,
        "error": None,
    }


def run_correlation(df: pd.DataFrame, columns: list[str]) -> dict:
    data = df[columns].dropna()
    n_obs = len(data)
    if n_obs < 3:
        return {"error": f"Insufficient data: n={n_obs}", "columns": columns,
                "n_obs": n_obs, "corr_matrix": None, "pvalue_matrix": None}

    n = len(columns)
    corr_vals = np.ones((n, n))
    p_vals = np.full((n, n), np.nan)

    for i in range(n):
        for j in range(n):
            if i != j:
                r, p = stats.pearsonr(data.iloc[:, i], data.iloc[:, j])
                corr_vals[i, j] = round(float(r), 3)
                p_vals[i, j] = round(float(p), 4)

    corr_dict = {columns[i]: {columns[j]: corr_vals[i, j] for j in range(n)}
                 for i in range(n)}
    pval_dict = {
        columns[i]: {
            columns[j]: (None if math.isnan(p_vals[i, j]) else p_vals[i, j])
            for j in range(n)
        }
        for i in range(n)
    }

    return {
        "columns": columns,
        "n_obs": int(n_obs),
        "corr_matrix": corr_dict,
        "pvalue_matrix": pval_dict,
        "error": None,
    }


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main() -> None:
    if not DATA_IN.exists():
        print(
            f"ERROR: CSV not found at {DATA_IN}\n"
            "Copy breyers-survey-data-cleaned.csv into scripts/data/ first.",
            file=sys.stderr,
        )
        sys.exit(1)

    print("Loading data…")
    df, question_text = load_data()
    concepts = list(CONCEPT_LABEL.values())
    print(f"  Loaded {len(df)} respondents, {len(df.columns)} columns")

    # ── 1. labels.json ────────────────────────────────────────────────────────
    print("\nWriting labels.json…")
    write_json(DATA_OUT / "labels.json", ALL_LABELS)

    # ── 2. question-text.json ─────────────────────────────────────────────────
    print("Writing question-text.json…")
    write_json(DATA_OUT / "question-text.json", question_text)

    # ── 3. survey.json  (full respondent data) ────────────────────────────────
    print("Writing survey.json…")
    records = df.to_dict(orient="records")
    write_json(DATA_OUT / "survey.json", records)

    # ── 4. overview.json ──────────────────────────────────────────────────────
    print("Writing stats/overview.json…")
    concept_dist = []
    for cell, label in CONCEPT_LABEL.items():
        sub = df[df["ClaimCell"] == cell]
        n = len(sub)
        mean_appeal = round(float(sub["Q11_Appeal"].mean()), 2) if n > 0 else None
        mean_pi = round(float(sub["Q12_PurchaseIntent"].mean()), 2) if n > 0 else None
        t2b = round(float(sub["Top2Box_PI"].mean()) * 100, 1) if n > 0 else None
        concept_dist.append({
            "concept_label": label,
            "claim_cell": cell,
            "n": n,
            "mean_appeal": mean_appeal,
            "mean_pi": mean_pi,
            "top2box_pct": t2b,
        })
    overview = {"total_n": len(df), "concept_distribution": concept_dist}
    write_json(STATS_OUT / "overview.json", overview)

    # ── 5. concept-performance.json ───────────────────────────────────────────
    print("Writing stats/concept-performance.json…")
    appeal_results = []
    pi_results = []
    for g1, g2 in combinations(concepts, 2):
        appeal_results.append({
            "group1": g1, "group2": g2,
            "result": run_ttest(df, "Q11_Appeal", "ConceptLabel", g1, g2),
        })
        pi_results.append({
            "group1": g1, "group2": g2,
            "result": run_ttest(df, "Q12_PurchaseIntent", "ConceptLabel", g1, g2),
        })
    write_json(STATS_OUT / "concept-performance.json",
               {"appeal": appeal_results, "purchase_intent": pi_results})

    # ── 6. regression-ols.json ────────────────────────────────────────────────
    print("Writing stats/regression-ols.json…")
    ols_results: dict[str, dict] = {}
    for ref in [1, 2, 3]:
        try:
            ols_results[str(ref)] = run_ols(df, reference_cell=ref)
        except Exception as exc:  # noqa: BLE001
            ols_results[str(ref)] = {"error": str(exc), "reference_cell": ref}
    write_json(STATS_OUT / "regression-ols.json", ols_results)

    # ── 7. regression-logit.json ──────────────────────────────────────────────
    print("Writing stats/regression-logit.json…")
    logit_results: dict[str, dict] = {}
    for ref in [1, 2, 3]:
        try:
            logit_results[str(ref)] = run_logit(df, reference_cell=ref)
        except Exception as exc:  # noqa: BLE001
            logit_results[str(ref)] = {"error": str(exc), "reference_cell": ref}
    write_json(STATS_OUT / "regression-logit.json", logit_results)

    # ── 8. correlations.json ──────────────────────────────────────────────────
    print("Writing stats/correlations.json…")
    corr_cols = [f"Q8_AttrImportance_{i}" for i in range(1, 8)] + \
                ["Q11_Appeal", "Q12_PurchaseIntent"]
    write_json(STATS_OUT / "correlations.json", run_correlation(df, corr_cols))

    # ── 9. price-sensitivity.json ─────────────────────────────────────────────
    print("Writing stats/price-sensitivity.json…")
    price_points_data = []
    for price_col, price_label in PRICE_POINTS.items():
        if price_col not in df.columns:
            continue
        col_data = df[price_col]
        overall_mean = round(float(col_data.mean()), 3)
        by_concept = {}
        for cell, label in CONCEPT_LABEL.items():
            sub = df.loc[df["ClaimCell"] == cell, price_col].dropna()
            by_concept[label] = round(float(sub.mean()), 3) if len(sub) > 0 else None
        price_points_data.append({
            "price_col": price_col,
            "price_label": price_label,
            "overall_mean": overall_mean,
            "by_concept": by_concept,
        })
    write_json(STATS_OUT / "price-sensitivity.json",
               {"price_points": price_points_data})

    # ── 10. crosstabs-options.json ────────────────────────────────────────────
    print("Writing stats/crosstabs-options.json…")
    def make_var(col: str, label: str, val_labels: dict) -> dict:
        return {
            "column": col,
            "label": label,
            "value_labels": {str(k): v for k, v in val_labels.items()},
        }

    row_variables = [
        make_var("Q4_PurchaseFreq", "Purchase Frequency", PURCHASE_FREQ),
        make_var("Q9_Tradeoff", "Protein vs Sugar Tradeoff", TRADEOFF),
        make_var("Q10_ActiveSeeking", "Active Seeking", ACTIVE_SEEKING),
        make_var("Q21_DietFocus", "Diet Focus", DIET_FOCUS),
        make_var("Q22_HouseholdType", "Household Type", HOUSEHOLD_TYPE),
        make_var("Q23_Age", "Age Group", AGE),
        make_var("Q24_Income", "Household Income", INCOME),
        make_var("Q13_Replacement", "Product Replacement", REPLACEMENT),
        make_var("Q16_PurchaseLocation", "Purchase Location", PURCHASE_LOCATION),
    ]
    col_variables = [
        make_var("ClaimCell", "Concept Cell", CONCEPT_LABEL),
        make_var("Top2Box_PI", "Top 2 Box Purchase Intent", TOP2BOX),
        make_var("Q21_DietFocus", "Diet Focus", DIET_FOCUS),
        make_var("Q23_Age", "Age Group", AGE),
    ]
    write_json(STATS_OUT / "crosstabs-options.json",
               {"row_variables": row_variables, "col_variables": col_variables})

    print("\nAll files written successfully.")


if __name__ == "__main__":
    main()
