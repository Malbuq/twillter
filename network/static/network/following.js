document.addEventListener("DOMContentLoaded", () => {
    viewPosts(0);
    console.log("happy zzzzzzz")
})

function viewPosts(page) {
    fetch(`/userInfo/${loggedInUserId}`)
    .then(response => response.json())
    .then(response => {
        document.querySelector("#latest-posts").innerHTML = ""; 
        response.followingPostsPages[page].forEach(post => {
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
                <a href="profilePage/${post.posterId}">${post.username}</a>
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
            
            document.querySelector("#latest-posts").append(postDiv);
        });
        likeHandler();
        if(response.followingPostsPages.length > 1) {
            paginationHanddler(response.followingPostsPages.length, page);
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




