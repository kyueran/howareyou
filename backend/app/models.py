from sqlalchemy import Column, Integer, String, Enum
from app.database import Base
import enum

class Language(str, enum.Enum):
    english = 'English'
    chinese = 'Chinese'
    malay = 'Malay'
    tamil = 'Tamil'

class Gender(str, enum.Enum):
    male = 'male'
    female = 'female'

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    language = Column(Enum(Language), nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    address = Column(String(255), nullable=True)
