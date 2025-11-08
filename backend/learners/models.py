from dataclasses import dataclass, field
from typing import Dict

@dataclass
class User: 
    name: str
    email: str 
    zipcode: int 
    exams: Dict[str, int] = field(default_factory = dict)
