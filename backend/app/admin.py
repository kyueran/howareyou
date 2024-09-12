from sqladmin import  ModelView
from app.models import User

class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.name, User.language, User.gender, User.address]

async def setup_admin(app):
    from sqladmin import Admin
    from app.database import engine

    admin = Admin(app, engine)
    admin.add_view(UserAdmin)
