from sqlalchemy.orm import Session
import json
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from models.jobs import Job
from models.answer import Answer
from models.users import User
from typing import List, Dict
from sentence_transformers import SentenceTransformer

embed_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

def eval_rank(labels_sorted: List[int], k: int = 10) -> Dict[str, float]:

    relevant_count = sum(1 for label in labels_sorted[:k] if label == 1)
    precision_at_k = relevant_count / k if k > 0 else 0
    return {"precision_at_k": precision_at_k}

def score_one_job(job_id, jd_text, cv_texts, alpha, k_eval=10):

    tfidf = TfidfVectorizer(max_features=11000, ngram_range=(1,2))
    X = tfidf.fit_transform(cv_texts + [jd_text])
    tfidf_sims = cosine_similarity(X[:-1], X[-1]).ravel()

    embs = embed_model.encode([jd_text] + cv_texts)
    emb_sims = cosine_similarity(embs[0:1], embs[1:]).ravel()

    final = alpha*tfidf_sims + (1-alpha)*emb_sims
    idx = np.argsort(-final)

    metrics = {}

    table = pd.DataFrame({
        "rank": np.arange(1, len(idx)+1),
        "tfidf": np.round(tfidf_sims[idx], 4),
        "embed": np.round(emb_sims[idx], 4),
        "final": np.round(final[idx], 4),
        "cv_text": np.array(cv_texts)[idx]
    })

    return metrics, table

async def get_job_matching_score(job_id: int, user_id: int, db: Session, alpha: float = 0.5):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return None, "Job not found"

    user_answers = db.query(Answer).filter(Answer.user_id == user_id).all()
    if not user_answers:
        return None, "User has no video answers/transcripts"

    combined_transcript = " ".join([answer.transcript for answer in user_answers if answer.transcript])
    if not combined_transcript:
        return None, "User has no transcripts available"

    jd_text = " ".join(json.loads(job.requirements))

    metrics, table = score_one_job(
        job_id=job_id,
        jd_text=jd_text,
        cv_texts=[combined_transcript], 
        alpha=alpha
    )
    
    if not table.empty:
        score = table['final'].iloc[0] * 100 
        return score, None
    
    return 0.0, "Could not calculate score"
