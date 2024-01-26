document.addEventListener("DOMContentLoaded", () => {
    viewPosts(0);
    console.log("asxxda ")
})

function viewPosts(page) {

    currentUserId = parseInt(window.location.pathname.split('/')[2]);

    fetch(`/userInfo/${currentUserId}`)
    .then(response => response.json())
    .then(response => {
        console.log(response)
        document.querySelector("#latest-posts").innerHTML = ""; 
        response.pages[page].forEach(post => {

            const postDiv = document.createElement('div');
            postDiv.className = "column-box";
            
            const editButton = document.createElement('button');
            editButton.innerHTML = 'Edit';
            editButton.className = 'round-edge-button';
            editButton.id = 'edit-tag';
            editButton.setAttribute('data-editpostid', `${post.id}`);

            const heartIcon = document.createElement('i');
            heartIcon.id = "likeButton";
            heartIcon.setAttribute('data-postId', `${post.id}`);
            heartIcon.className = "far fa-heart custom-heart"

            if(post.userLiked) {
                heartIcon.className = "fas fa-heart custom-heart"
            }

            if(post.posterId != loggedInUserId) {
                editButton.style.display = 'none';
            }

            postDiv.innerHTML = `

            <div class="top-div-post" data-topDivId=${post.id}>
                <div class="user-info-tag">
                <a href="${post.posterId}">${post.username}</a>
                    <div>&middot</div>
                    <h6> ${post.timestamp.slice(0,6)}</h6>
                </div>
                <div class="buttons-tag" data-topButtonDivId=${post.id}>${editButton.outerHTML}</div>
            </div>

                <div id="content-div" data-contentDivId=${post.id}>
                    <p id="content-tag" data-contentTag=${post.id}>${post.content}</p>
                </div>

                <div class="div-like">
                    ${heartIcon.outerHTML}
                    <span id="likeCount" data-countPostId = ${post.id}> ${post.countLikes}</span> 
                </div>
            
            `;
            
            //console.log(document.querySelector('#edit-tag').innerHTML);
            document.querySelector("#latest-posts").append(postDiv);
        });
        if(loggedInUserId != ""){
            likeHandler();
            editPost();
        }
        viewProfile(response.user);
        if(response.pages.length > 1) {
            paginationHanddler(response.pages.length, page);
        }
    })
}

function likeHandler() {
    document.querySelectorAll('#likeButton').forEach(button => {
        button.addEventListener('click', () => {
            
            postId = parseInt(button.dataset.postid);

            fetch(`/likeHanddler/${postId}`, {
                method: 'POST',
              })
              .then(response => response.json())
              .then(data => {
                  const likeCase = data.message;
                  const currLikeCount = parseInt(document.querySelector(`[data-countPostId="${postId}"]`).innerHTML);
                  const likesElement = document.querySelector(`[data-countPostId="${postId}"]`);
                  if(likeCase[0] == 'L') {
                      likesElement.innerHTML = currLikeCount + 1;
                      button.className = 'fas fa-heart custom-heart'
                    } else {
                        likesElement.innerHTML = currLikeCount - 1;
                        button.className = 'far fa-heart custom-heart'
                  }
                  
              })
              .catch(error => {
                console.log('Error:', error);
              });


        })
    })
}

function editPost() {
    document.querySelectorAll('#edit-tag').forEach(editButton => {
        editButton.addEventListener('click', () => {
            
            editButton.style.display = 'none';

            const postId = parseInt(editButton.dataset.editpostid);

            const currContentElement = document.querySelector(`[data-contentTag="${postId}"]`);
            currContentElement.style.display = 'none';
            
            const textElement = document.createElement('textarea');
            textElement.value = currContentElement.innerHTML;

            const divContentElement = document.querySelector(`[data-contentDivId="${postId}"]`);
            divContentElement.append(textElement);
    
            const cancelButton = document.createElement('button');
            cancelButton.innerHTML = 'Cancel';
            cancelButton.className = 'round-edge-button';
            document.querySelector(`[data-topButtonDivId="${postId}"]`).append(cancelButton);

            cancelButton.addEventListener('click', () => {

                currContentElement.style.display = 'block';
                
                textElement.style.display = 'none';
                
                saveButton.style.display = 'none';

                editButton.style.display = 'block';

                cancelButton.style.display = 'none';
            })

            const saveButton = document.createElement('button');
            saveButton.innerHTML = 'Save';
            saveButton.className = 'round-edge-button';
            saveButton.disabled = true;
            
            document.querySelector(`[data-topButtonDivId="${postId}"]`).append(saveButton);

            let newContent = textElement.value;
            
            
            textElement.onkeyup = () => {

                newContent = textElement.value;
                
                if((newContent != currContentElement.innerHTML && newContent.length > 0)) {
                    saveButton.disabled = false;
                }
                else {
                    saveButton.disabled = true;
                }
                
            }
            
            saveButton.addEventListener('click', () => {

                newContent = textElement.value;

                fetch('/editPost', {
                    method: 'POST',
                    body: JSON.stringify({
                        newContent: newContent,
                        postId: postId
                    })
                })
                .then(response => response.json())
                .then(result => {
                    console.log(result);
                })
                .catch(error => {
                    console.log('Error:', error);
                });
                
                currContentElement.innerHTML = newContent;
                
                currContentElement.style.display = 'block';
                
                textElement.style.display = 'none';
                
                saveButton.style.display = 'none';

                editButton.style.display = 'block';

                cancelButton.style.display = 'none';

            })

        })
    })
}

function viewProfile(userInfo) {
    const followersElement = document.querySelector("#profile-followers");
    followersElement.innerHTML = `${userInfo.countFollowers} followers`
    document.querySelector("#profile-following").innerHTML = `${userInfo.countFollowings} following`
    document.querySelector("#username-tag").innerHTML = `${userInfo.username}`
    
    followButtonHanddler = document.createElement('button');
    followButtonHanddler.className = 'round-edge-button';
    document.querySelector("#profile-follow-button-div").innerHTML = "";
    document.querySelector("#profile-follow-button-div").append(followButtonHanddler);
    followButtonHanddler.style.display = 'none';
    
    if(parseInt(loggedInUserId) != userInfo.id && loggedInUserId != "") {
        followButtonHanddler.style.display = 'block';
        
        if(userInfo.loggedUserFollows) {
            followButtonHanddler.innerHTML = 'Unfollow';
        } 
        else {
            followButtonHanddler.innerHTML = 'Follow';
        }
        
        followButtonHanddler.addEventListener('click', () => {
            
            userInfo.toFollow = followButtonHanddler.innerHTML;
            
            if(followButtonHanddler.innerHTML == 'Unfollow') {
                followButtonHanddler.innerHTML = 'Follow';
                userInfo.countFollowers--;
                followersElement.innerHTML = `${userInfo.countFollowers} followers`
            } else {
                followButtonHanddler.innerHTML = 'Unfollow';
                userInfo.countFollowers++;
                followersElement.innerHTML = `${userInfo.countFollowers} followers`
            }
            
            followSave(userInfo)
        });
    }
    else if(loggedInUserId == "") {
        followButtonHanddler.style.display = 'block';
        
        followButtonHanddler.innerHTML = 'Login to Follow';
        
        followButtonHanddler.addEventListener('click', () => {
            window.location.href="/login";    
            
        })
    }
}
    
    function followSave(userInfo) {
        
        fetch('/followHanddler', {
            method: 'POST',
            body: JSON.stringify({
                followerId: parseInt(loggedInUserId),
                userToFollowId: userInfo.id,
                toFollow: userInfo.toFollow,
            })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.log('Error:', error);
    });

}

function paginationHanddler(numPages, currPage) {
    document.querySelector('#pagination-div').innerHTML = "";
    const footerElement = document.createElement("footer");

    footerElement.innerHTML = `
        <ul id="ul-item" class="pagination pagination-sm"></ul>
    `;

    document.querySelector('#pagination-div').append(footerElement);
    
    for(let i = 0; i < numPages; i++) {
        const listElement = document.createElement('li');
        listElement.innerHTML = `<a class="page-link" id="pagination-li" data-pageNumber = ${i}>${i+1}</a>`;
        if(currPage == i) {
            listElement.className = "page-item active";
        } else {
            listElement.className = "page-item";
        }

        document.querySelector("#ul-item").append(listElement);
    }

    document.querySelector('#pagination-div').append(footerElement);

    document.querySelectorAll('#pagination-li').forEach(button => {
        button.addEventListener('click', () => viewPosts(button.dataset.pagenumber));
    })

}