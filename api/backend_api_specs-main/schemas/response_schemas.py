from typing import Any, List, Optional, Dict, TypeVar, Generic
from pydantic import BaseModel, Field, ConfigDict

# TypeVar for generic data type in StandardResponse
T = TypeVar('T')

class ErrorObject(BaseModel):
    code: str
    message: str
    field: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class StandardResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(
        arbitrary_types_allowed=False,
        validate_assignment=True,
        use_enum_values=True,
        str_strip_whitespace=True
    )

    success: bool
    data: Optional[T] = None
    errors: List[ErrorObject] = Field(default_factory=list)

    @classmethod
    def success_response(
        cls,
        data: T,
        request_start_time: Optional[float] = None 
    ) -> "StandardResponse[T]":
        """Create a successful response"""
        return cls(
            success=True,
            data=data,
            errors=[]
        )

    @classmethod
    def error_response(
        cls,
        errors: List[ErrorObject],
        request_start_time: Optional[float] = None
    ) -> "StandardResponse[None]":
        """Create an error response"""
        return cls(
            success=False,
            data=None,
            errors=errors
        )