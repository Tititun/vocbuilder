import React from 'react';
import { Question } from './question.js'
import _ from "lodash";

const quiz_link = document.querySelector('#quiz_link') 

export const Quiz = function() {
    console.log('rendering quiz')
    const [words, setWords] = React.useState(_.sampleSize(Object.keys(db_data.words), 3))
    const myModal = React.useRef(0);


    React.useEffect(() => {
        myModal.current = new bootstrap.Modal(document.querySelector('#quiz_modal'))
        const show_modal = (e) => {
            e.preventDefault();    
            myModal && myModal.current.show()
        }
        quiz_link.addEventListener('click', show_modal)
        return () => quiz_link.removeEventListener('click', show_modal)
    }, [])

    function closeModal () {myModal && myModal.current.hide()}

    return (
        <div className="modal" id="quiz_modal" tabindex="-1">
            <div className="modal-dialog modal-xl" >
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title text-center w-100">Quiz</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                     onClick={closeModal}></button>
                </div>
                <div className="modal-body d-flex flex-lg-row flex-md-column container-fluid justify-content-center p-4">
                    {words.map((word, idx) => {
                        return <Question key={db_data.words[word]['word_id']} word={word} />
                            }
                        )
                    }
                </div>
                <div className="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button id="refresh_quiz" type="button" class="btn btn-success" onClick={() => setWords(_.sampleSize(Object.keys(db_data.words), 3))}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
                        </svg>
                    </button>
                </div>
                </div>
            </div>
        </div>
    )
}
