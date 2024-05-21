import React from 'react';
import _ from "lodash";
import { composeDefinitions } from './utils';


export const Question = function({word}) {
    console.log(word)
    const [inputValue, setInputValue] = React.useState('')
    const [success, setSuccess] = React.useState(false)

    let use_record = _.sample(db_data.words[word].usages)
    let context = use_record.context;
    let usage = use_record.usage;
    let index = usage.indexOf(context);
    let usage_begin = usage.substring(0, index);
    let ctx = usage.substring(index, index + context.length);
    let usage_end = usage.substring(index + context.length)
    let definitions = composeDefinitions(db_data.words[word].definitions)


    return (
            <div id={`question_${db_data.words[word]['word_id']}`}  key={db_data.words[word]['word_id']} className="card ms-2 shadow col-4">
                <div className="card-body  d-flex flex-column">
                    <h5 className="card-title"></h5>
                    <p className="card-text">
                        {usage_begin}
                        <strong>
                            {success
                            ? 
                            <span className='bg-success-subtle rounded'>{ctx}</span>
                            :
                            <input 
                                onInput={(e) => {
                                    let value = e.target.value
                                    console.log(value, ctx)
                                    if (value.length > ctx.length){
                                        setInputValue(value.slice(0, ctx.length))
                                    }
                                    if (value.length == ctx.length) {
                                        if (value.toLowerCase() == ctx.toLowerCase()) {
                                            setInputValue(value)
                                            setSuccess(true)
                                        }}
                                    }
                                }
                                className={`text-center bg-info-subtle border-0 rounded`}
                                id={'quiz_' + db_data.words[word]['word_id']}
                                placeholder={'*'.repeat(ctx.length)}
                                style={{width: `${ctx.length * 12}px`}}>
                            </input>
                            }
                        </strong>
                        {usage_end}
                    </p>
                    <p className="blockquote-footer">{use_record.book.title}</p>
                    <div className="mt-auto d-flex">
                        <button type="button" className="btn btn-link" onClick={() => {
                            const input_el = document.querySelector(`#quiz_${db_data.words[word]['word_id']}`);
                            const first_letter = ctx.slice(0, 1)
                            input_el.dataset.firstLetter = first_letter
                            input_el.value = first_letter
                        }}>First letter?</button>
                        <button type="button" className="btn btn-link ms-auto" data-bs-container="body">
                             Show definition
                        </button>
                    </div>
                </div>
            </div>
    )
}