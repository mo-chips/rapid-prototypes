from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any, Optional
from app.memory.long_term import get_long_term_memories, save_long_term_memory, delete_long_term_memory
from app.security.auth import verify_api_key

router = APIRouter(prefix="/memory", tags=["Memory"])

@router.get("", dependencies=[Depends(verify_api_key)])
async def list_memories(category: Optional[str] = Query(None)):
    """Fetch long-term memory entries, optionally filtering by category."""
    if category and category not in ('preference', 'note', 'learned_behavior', 'alias'):
        raise HTTPException(
            status_code=400, 
            detail="Invalid category. Must be 'preference', 'note', 'learned_behavior', or 'alias'."
        )
    memories = get_long_term_memories(category)
    return {"memories": memories}

@router.post("", dependencies=[Depends(verify_api_key)])
async def create_memory(payload: Dict[str, str]):
    """Create or update a long-term memory record."""
    category = payload.get("category")
    key = payload.get("key")
    value = payload.get("value")
    
    if not all([category, key, value]):
        raise HTTPException(status_code=400, detail="category, key, and value are all required.")
        
    if category not in ('preference', 'note', 'learned_behavior', 'alias'):
        raise HTTPException(
            status_code=400, 
            detail="Invalid category. Must be 'preference', 'note', 'learned_behavior', or 'alias'."
        )
        
    try:
        record_id = save_long_term_memory(category, key, value)
        return {
            "status": "saved",
            "id": record_id,
            "category": category,
            "key": key
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save memory: {str(e)}")

@router.delete("/{memory_id}", dependencies=[Depends(verify_api_key)])
async def delete_memory(memory_id: int):
    """Remove a long-term memory entry by its record ID."""
    success = delete_long_term_memory(memory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory entry not found.")
    return {"status": "deleted", "id": memory_id}
