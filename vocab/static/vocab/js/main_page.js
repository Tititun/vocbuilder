var post_main_url = '{% url "vocab:index" %}'

document.querySelector('#example_image').addEventListener('click', (e) => {
    e.target.classList.add('big')
    document.querySelector('#dropzone-main').submit()
})