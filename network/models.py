from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("User", blank=True, related_name = "followingList")

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "countFollowers": self.followers.all().count(), 
            "countFollowings": self.followingList.all().count(),
        }

    def __str__(self):
        return f"Username: {self.username}"

class Post(models.Model):
    poster = models.ForeignKey(User, on_delete = models.CASCADE, related_name = "posts")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    likers = models.ManyToManyField(User, blank=True, null = True, related_name = "likes")

    def serialize(self):
        return {
            "id": self.id,
            "username": self.poster.username,
            "posterId": self.poster.id,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "countLikes": self.likers.all().count(),
        }

    def __str__(self):
        return f"Post by {self.poster.username}, with content of: {self.content}"

class Comment(models.Model):
    commenter = models.ForeignKey(User, on_delete = models.DO_NOTHING, related_name = "comments")
    postCommented = models.ForeignKey(Post, blank=True, null=True, on_delete = models.CASCADE, related_name = "comments")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "commenterId": self.commenter.id,
            "content": self.content,
            "postComented": self.postCommented.id,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
        }
    
    def __str__(self):
        return f"Comment by {self.commenter.username}, with the content of: {self.content}"