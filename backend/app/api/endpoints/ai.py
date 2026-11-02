from fastapi import APIRouter
from app.schemas.all_schemas import (
    AiChatRequest,
    AiChatResponse,
    AiClassificationRequest,
    AiClassificationResponse
)
from app.services.ai_service import SafetyAssistant, SafetyReportClassifier

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/chat", response_model=AiChatResponse)
def chat_with_safety_assistant(req: AiChatRequest):
    return SafetyAssistant.get_response(req.message, req.context)

@router.post("/classify-report", response_model=AiClassificationResponse)
def classify_report_text(req: AiClassificationRequest):
    return SafetyReportClassifier.classify(req.text)
