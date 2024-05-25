const drag_example = document.querySelector('#example_image');
const drag_target = document.querySelector('#dropzone-main');

Dropzone.options.dropzoneMain = {
    paramName: "file",
    maxFilesize: 200,
    maxFiles: 1,
    acceptedFiles: '.db',
    addRemoveLinks: true,
    autoProcessQueue: false,
    hiddenInputContainer: document.querySelector('#dropzone-main'),
    accept: function(file, done) {
        document.querySelector('[type="file"]').name = 'db'
        drag_target.requestSubmit();
        done();
   }
 };


//function send_db(db, example=false) {
//    const csrftoken = Cookies.get('csrftoken');
//    console.log(csrftoken)
//    const url = post_main_url;
//    var options = {
//        method: 'POST',
//        headers: {'X-CSRFToken': csrftoken},
//        mode: 'same-origin'
//    }
//    let formData = new FormData();
//    formData.append('db', example ? 'example' : db);
//    options['body'] = formData;
//
//    fetch(url, options)
//    .then(response => response.json())
//    .then(data => {
//        console.log(data)
//    })
//
//}


