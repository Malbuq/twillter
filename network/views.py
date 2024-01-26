from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist
import json
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator

from .models import *


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


#Post code

@csrf_exempt
@login_required
def newPost(request): #creates a post

    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    posterId = request.user.id
    poster = User.objects.get(id=posterId)
    
    data = json.loads(request.body)

    content = data["content"]

    post = Post(
        content = content,
        poster = poster,
    )

    post.save()

    return JsonResponse({"message": "Post created successfully."}, status=201)

def post(request, postId): #check the info from a particular post and edit post

    try:
        post = Post.objects.get(id=postId)
    except Post.DoesNotExist:
        return JsonResponse({"error": "This post doest not exist"}, status = 400)

    if request.method == "GET": #get all info from a post

        response_data = {
            "post": post.serialize(),
            "comments": [post.serialize() for post in post.comments.all().order_by('-id')],
        }

        return JsonResponse(response_data, safe=False)

@csrf_exempt
@login_required
def editPost(request):
    data = json.loads(request.body)

    newContent = data["newContent"]
    postId = int(data["postId"])

    post = Post.objects.get(id=postId)

    post.content = newContent
    post.save()
    return JsonResponse({"message": "This post was edited"}, status = 200)
   

@csrf_exempt
@login_required
def likeHanddler(request, postId):

    try:
        post = Post.objects.get(id=postId)
    except Post.DoesNotExist:
        return JsonResponse({"error": "This post doest not exist"}, status = 400)
    
    try:
        likerId = request.user.id
        liker = User.objects.get(id=likerId)
    except User.DoesNotExist:
        return JsonResponse({"error": "This user doest not exist"}, status = 400)

    if liker in post.likers.all():
        post.likers.remove(liker)
        post.save()
        return JsonResponse({"message": "Unliked the post"}, status = 200)
    else:
        post.likers.add(liker)
        post.save()
        return JsonResponse({"message": "Liked the post"}, status = 200)
 
def allPosts(request): #Get all the latest comments in the datebase
    if request.method != "GET":
        return JsonResponse({"error": "GET request required"})
    
    posts = Post.objects.all().order_by('-id')
    
    postsInfo = []
    if request.user.id is not None:
        user = User.objects.get(id=request.user.id)
        for post in posts:
            data = post.serialize()
            data["userLiked"] = False
            if user in post.likers.all():
                data["userLiked"] = True
            postsInfo.append(data)
    else:
        for post in posts:
            data = post.serialize()
            data["userLiked"] = False
            postsInfo.append(data)


    list_pages = []
    pages = Paginator(postsInfo, 10)

    for i in range(pages.num_pages):
        list_pages.append(pages.page(i+1).object_list)

    response_data = {
            "pages": list_pages,
        }

    return JsonResponse(response_data, safe=False)

#----------------------------------------------------USER---------------------------------------------------- 
def userInfo(request, userId):
    
    if request.method != "GET":
        return JsonResponse({"error": "GET request required"})
    

    try:
        user = User.objects.get(id=userId)
    except User.DoesNotExist:
        return JsonResponse({"error": "This user doest not exist"}, status = 400)
    
    posts = user.posts.all().order_by('-id')

    if request.user.id is not None:
        loggedUser = User.objects.get(id=request.user.id)

        postsInfo = []
        for post in posts:
            data = post.serialize()
            data["userLiked"] = False
            if loggedUser in post.likers.all():
                data["userLiked"] = True
            if loggedUser in user.followers.all():
                data["loggedUserFollows"] = True
            postsInfo.append(data)

        list_pages = []
        pages = Paginator(postsInfo, 10)

        for i in range(pages.num_pages):
            list_pages.append(pages.page(i+1).object_list)


        userInfo = []
        userInfo = user.serialize()
        userInfo["loggedUserFollows"] = False

        if loggedUser in user.followers.all():
            userInfo["loggedUserFollows"] = True

        followingPosts = []
        
        for following in loggedUser.followingList.all():
            for post in following.posts.all().order_by('-id'):
                data = post.serialize()
                data["userLiked"] = False
                if loggedUser in post.likers.all():
                    data["userLiked"] = True 
                followingPosts.append(data)
        
        followingPosts = sorted(followingPosts, key=lambda x: x['id'], reverse=True)

        followingPostPages = []
        pages = Paginator(followingPosts, 10)

        for i in range(pages.num_pages):
            followingPostPages.append(pages.page(i+1).object_list)

        response_data = {
            "user": userInfo,
            "followingPostsPages": followingPostPages,
            "pages": list_pages,
        }
    else:
        postsInfo = []
        for post in posts:
            data = post.serialize()
            data["userLiked"] = False
            postsInfo.append(data)

        list_pages = []
        pages = Paginator(postsInfo, 10)

        for i in range(pages.num_pages):
            list_pages.append(pages.page(i+1).object_list)


        userInfo = []
        userInfo = user.serialize()
        userInfo["loggedUserFollows"] = False

        response_data = {
            "user": userInfo,
            "pages": list_pages,
        }


    return JsonResponse(response_data, safe=False)



def profilePage(request, userId):
    return render(request, "network/profilePage.html")

#---------------------------------------------------------
@csrf_exempt
@login_required
def followHanddler(request):

    if request.method == "POST":
        data = json.loads(request.body)
        
        follower = User.objects.get(id=data["followerId"])
        userToFollow = User.objects.get(id=data["userToFollowId"])

        if data["toFollow"][0][0] == 'F':
            userToFollow.followers.add(follower)
            return JsonResponse({"message": "Follwed"})
        else:
            userToFollow.followers.remove(follower)
            return JsonResponse({"message": "Unollwed"})
    
def following(request):
    if request.user.id == None:
        return HttpResponseRedirect(reverse('login'))
    else:
        return render(request, "network/following.html")