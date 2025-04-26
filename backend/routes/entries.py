from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Optional
import uuid
from datetime import datetime

from models.entry import (
    LectureBase,
    LectureUpdate,
    LectureSummary,
    Question,
    LectureResponse,
)
from database import lectures_collection
from services.gemini import generate_summary, generate_questions

router = APIRouter()

@router.post("/startLecture", response_model=LectureResponse)
async def start_lecture(snap_user_id: str):
    lecture_id = str(uuid.uuid4())
    lecture = LectureBase(
        snap_user_id=snap_user_id,
        lecture_id=lecture_id,
    )
    await lectures_collection.insert_one(lecture.dict())
    return LectureResponse(lecture_id=lecture_id)

@router.patch("/updateInfo")
async def update_info(
    snap_user_id: str,
    lecture_id: str,
    audio: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None)
):
    lecture = await lectures_collection.find_one({
        "snap_user_id": snap_user_id,
        "lecture_id": lecture_id,
        "is_active": True
    })
    
    if not lecture:
        raise HTTPException(status_code=404, detail="Active lecture not found")
    
    update_data = {}
    if audio:
        audio_content = await audio.read()
        # In a real implementation, you'd want to store this in a proper storage service
        update_data["audio_data"] = audio_content
    
    if image:
        image_content = await image.read()
        # In a real implementation, you'd want to store this in a proper storage service
        update_data["image_data"] = image_content
    
    if update_data:
        await lectures_collection.update_one(
            {"lecture_id": lecture_id},
            {"$set": update_data}
        )
    
    return {"status": "updated"}

@router.get("/requestSummary", response_model=LectureSummary)
async def request_summary(snap_user_id: str, lecture_id: str):
    lecture = await lectures_collection.find_one({
        "snap_user_id": snap_user_id,
        "lecture_id": lecture_id
    })
    
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    # In a real implementation, you'd process the actual audio/transcript
    # Here we're just using a placeholder
    summary = await generate_summary("Sample transcript")
    return LectureSummary(text=summary, slides=[])

@router.get("/requestQuestions")
async def request_questions(snap_user_id: str, lecture_id: str):
    lecture = await lectures_collection.find_one({
        "snap_user_id": snap_user_id,
        "lecture_id": lecture_id
    })
    
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    # In a real implementation, you'd process the actual lecture content
    questions = await generate_questions("Sample transcript")
    return [
        Question(question=q, pre_searched_answer=a)
        for q, a in questions
    ]

@router.post("/endLecture")
async def end_lecture(snap_user_id: str):
    result = await lectures_collection.update_one(
        {
            "snap_user_id": snap_user_id,
            "is_active": True
        },
        {
            "$set": {
                "is_active": False,
                "end_time": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="No active lecture found")
    
    return {"status": "ended"} 