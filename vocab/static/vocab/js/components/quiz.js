import React from 'react';
import { Question } from './question.js'
import _ from "lodash";

const quiz_link = document.querySelector('#quiz_link') 

export const Quiz = function() {

    React.useEffect(() => {
        const myModal = new bootstrap.Modal(document.querySelector('#quiz_modal'))
        const show_modal = () => myModal.show() 
        quiz_link.addEventListener('click', show_modal)
        return () => quiz_link.removeEventListener('click', show_modal)
    })

    return (
        <div class="modal" id="quiz_modal" tabindex="-1">
            <div class="modal-dialog modal-xl" >
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title text-center w-100">Quiz</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body d-flex justify-content-center p-4">
                    {_.sampleSize(Object.keys(db_data.words), 3).map((word, idx) => {
                        return <Question key={idx} word={word} />
                            }
                        )
                    }
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Submit</button>
                </div>
                </div>
            </div>
        </div>
    )
}
