from dataclasses import dataclass, field
from typing import Dict, Optional

@dataclass
class User: 
    name: str
    email: str 
    zipcode: int 
    maxCredits: Optional[int] = None
    exams: Dict[str, int] = field(default_factory = dict)
