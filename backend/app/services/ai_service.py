import re
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.schemas.all_schemas import AiChatResponse, AiClassificationResponse

class SafetyAssistant:
    """
    AI Safety Assistant that provides personal safety guidance, platform walkthroughs,
    and official emergency helpline recommendations.
    Strictly ethical: never pretends to be a 911/112 police dispatcher.
    """

    EMERGENCY_KEYWORDS = [
        "help", "emergency", "attack", "stalk", "danger", "save me", "trapped",
        "following me", "hurt", "bleeding", "threat", "assault"
    ]

    RULE_KNOWLEDGE_BASE = [
        {
            "patterns": [r"how.*(sos|emergency)", r"what is.*sos", r"activate.*sos"],
            "reply": (
                "To activate the Emergency SOS in SURAKSHA AI:\n"
                "1. Tap the prominent coral SOS button on your dashboard or Emergency Center.\n"
                "2. The system captures your real-time GPS coordinates and creates an active incident record.\n"
                "3. Instant SMS and Email notifications are broadcasted to all your active Trusted Contacts.\n"
                "4. A secured, cryptographically time-limited tracking link is generated.\n"
                "Note: SURAKSHA AI supplements but does not replace official emergency services. In immediate danger, call 112 directly."
            ),
            "suggestions": ["How to add trusted contacts?", "Call 112 emergency hotline", "Share live location"]
        },
        {
            "patterns": [r"contact", r"add.*friend", r"parent", r"relative", r"trusted"],
            "reply": (
                "You can configure up to 5 Trusted Contacts in the 'Trusted Contacts' tab. "
                "Specify their name, relationship, phone number, and email. You can choose whether they receive SMS, "
                "Email, or both during an emergency broadcast. Make sure they have consented and know to act quickly."
            ),
            "suggestions": ["Go to Trusted Contacts", "Test emergency notification", "Privacy and consent"]
        },
        {
            "patterns": [r"helpline", r"police", r"number", r"ambulance", r"112", r"call"],
            "reply": (
                f"Emergency Helplines (India):\n"
                f"• National Unified Emergency Number: {settings.NATIONAL_EMERGENCY_NUMBER}\n"
                "• Women Helpline (All India): 1091\n"
                "• Women in Distress (NCW): 7827170170 / 181\n"
                "• Police: 100\n"
                "• Ambulance / Medical Emergency: 108 / 102\n"
                "SURAKSHA AI does not automatically call emergency services without authorized operator integration."
            ),
            "suggestions": ["Call 112", "Find nearby police stations", "Trigger test SOS"]
        },
        {
            "patterns": [r"location", r"track", r"share", r"live"],
            "reply": (
                "Live Location Sharing allows you to create a secure, time-limited tracking link (from 15 minutes up to 24 hours). "
                "Anyone with the link can view your real-time coordinates on OpenStreetMap. You can revoke the link anytime with one click, "
                "and tokens are securely hashed with SHA-256."
            ),
            "suggestions": ["Start location share", "Manage active shares", "Location privacy policy"]
        },
        {
            "patterns": [r"report", r"incident", r"street light", r"dark", r"unsafe"],
            "reply": (
                "Community Safety Reporting lets users report safety hazards like broken street lights, harassment spots, "
                "or lack of public transport. Reports are reviewed by moderators before public display, and all identifying personal details "
                "are protected to preserve reporter privacy."
            ),
            "suggestions": ["Submit a safety report", "View community map", "Report categories"]
        },
        {
            "patterns": [r"night", r"commute", r"travel", r"tips", r"alone", r"safety tip"],
            "reply": (
                "Night Travel Safety Tips:\n"
                "• Keep your phone charged and share your live trip session using SURAKSHA AI Check-In.\n"
                "• Stick to well-lit, populated routes even if they take a few extra minutes.\n"
                "• Keep your emergency contacts on speed dial or keep the SURAKSHA AI SOS screen ready.\n"
                "• If using a cab, verify vehicle number and driver identity, and ensure GPS tracking is on.\n"
                "• Trust your instincts—if a situation feels wrong, move into a lit commercial store immediately."
            ),
            "suggestions": ["Create travel check-in", "Find well-lit routes", "Emergency SOS"]
        }
    ]

    @classmethod
    def get_response(cls, message: str, context: Optional[str] = None) -> AiChatResponse:
        lower_msg = message.lower()
        is_emergency = any(kw in lower_msg for kw in cls.EMERGENCY_KEYWORDS)

        # Immediate danger guidance
        if is_emergency:
            return AiChatResponse(
                reply=(
                    "⚠️ IF YOU ARE IN IMMEDIATE PHYSICAL DANGER, PLEASE CALL 112 OR LOCAL POLICE RIGHT NOW!\n\n"
                    "Tap the coral SOS button at the top of your screen to broadcast your GPS location to your trusted contacts immediately. "
                    "I am an automated safety assistant and cannot dispatch emergency rescue units directly."
                ),
                suggestions=["TRIGGER SOS NOW", "Call 112 Emergency", "Share Live Location"],
                source="rule_based",
                is_emergency_flagged=True
            )

        # Match against knowledge patterns
        for item in cls.RULE_KNOWLEDGE_BASE:
            for pat in item["patterns"]:
                if re.search(pat, lower_msg):
                    return AiChatResponse(
                        reply=item["reply"],
                        suggestions=item["suggestions"],
                        source="rule_based",
                        is_emergency_flagged=False
                    )

        # Default fallback guidance
        return AiChatResponse(
            reply=(
                "I am your SURAKSHA AI Safety Assistant. I can help guide you through emergency SOS features, "
                "adding trusted contacts, setting up live location tracking, submitting community hazard reports, "
                "or looking up verified emergency numbers (e.g. 112). How can I assist you today?"
            ),
            suggestions=[
                "How does Emergency SOS work?",
                "Emergency helpline numbers",
                "How to share my live location?",
                "Night travel safety tips"
            ],
            source="rule_based",
            is_emergency_flagged=False
        )


class SafetyReportClassifier:
    """
    Explainable classifier for community safety reports.
    Categorizes reports into: lighting, harassment, infrastructure, transport, other.
    """

    CATEGORIES = {
        "lighting": [
            "light", "dark", "lamp", "bulb", "pitch", "street light", "illumination",
            "blackout", "shadow", "visibility", "no light"
        ],
        "harassment": [
            "stalk", "follow", "catcall", "harass", "tease", "stare", "grope",
            "drunk", "gang", "threaten", "whistle", "lewd", "unsafe men", "comment"
        ],
        "infrastructure": [
            "pothole", "broken", "construction", "fence", "abandoned", "cctv",
            "camera", "building", "sidewalk", "pavement", "isolated", "blind spot"
        ],
        "transport": [
            "bus", "cab", "taxi", "rickshaw", "auto", "metro", "station", "stop",
            "driver", "fare", "overcrowded", "route", "van"
        ]
    }

    @classmethod
    def classify(cls, text: str) -> AiClassificationResponse:
        lower_text = text.lower()
        scores: Dict[str, int] = {cat: 0 for cat in cls.CATEGORIES}
        matched_words: Dict[str, List[str]] = {cat: [] for cat in cls.CATEGORIES}

        for cat, keywords in cls.CATEGORIES.items():
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', lower_text):
                    scores[cat] += 1
                    matched_words[cat].append(kw)

        best_cat = max(scores, key=scores.get)
        max_score = scores[best_cat]

        if max_score > 0:
            confidence = min(0.60 + (max_score * 0.15), 0.95)
            explanation = (
                f"Classified as '{best_cat}' based on matching safety keywords: "
                f"{', '.join(matched_words[best_cat][:4])}."
            )
            return AiClassificationResponse(
                suggested_category=best_cat,
                confidence=round(confidence, 2),
                source="rule_based_explainable",
                explanation=explanation
            )

        return AiClassificationResponse(
            suggested_category="other",
            confidence=0.50,
            source="rule_based_default",
            explanation="No specific category keywords detected. Defaulted to general safety concern."
        )
