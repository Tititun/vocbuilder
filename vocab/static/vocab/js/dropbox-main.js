Dropzone.options.dropzoneMain = {
    paramName: "file",
    maxFilesize: 100,
    maxFiles: 1,
    accept: function(file, done) {
     if (file.name == "justinbieber.jpg") {
        done("Naha, you don't.");
     }
     else {
        done();
     }
   }
 };

const drag_example = document.querySelector('#example_image');
const drag_target = document.querySelector('#dropzone-main');

drag_example.addEventListener('dragend', e => {
    console.log('end');
    let b = drag_target.getBoundingClientRect(); // boundaries
    if (e.x >= b.left && e.x <= b.right && e.y >= b.top && e.y <= b.bottom) {
        console.log('inside')
    }
});


