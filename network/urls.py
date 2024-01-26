
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post/<int:postId>", views.post, name="post"),
    path("newPost", views.newPost, name="newPost"),
    path("allPosts", views.allPosts, name="allPosts"),
    path("editPost", views.editPost, name="editPost"),
    path("following", views.following, name="following"),
    path("followHanddler", views.followHanddler, name="followHanddler"),
    path("userInfo/<int:userId>", views.userInfo, name="userInfo"),
    path("likeHanddler/<int:postId>", views.likeHanddler, name="likeHanddler"),
    path("profilePage/<int:userId>", views.profilePage, name="profilePage"),
]
