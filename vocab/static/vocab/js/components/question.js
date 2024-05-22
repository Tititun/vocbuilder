import React from 'react';
import ReactDOM from 'react-dom';
import _ from "lodash";
import { composeDefinitions } from './utils';



export const Question = function({word}) {
    const [inputValue, setInputValue] = React.useState('')
    const [success, setSuccess] = React.useState(false)
    const [show, setShow] = React.useState(false)
    const [firstLetter, setFirstLetter] = React.useState('')
    const use_record = React.useRef(_.sample(db_data.words[word].usages))
    
    let context = use_record.current.context;
    let usage = use_record.current.usage;
    let index = usage.indexOf(context);
    let usage_begin = usage.substring(0, index);
    let ctx = usage.substring(index, index + context.length);
    let usage_end = usage.substring(index + context.length)
    let definitions = composeDefinitions(db_data.words[word].definitions)

    React.useEffect(
        () => {
            const popover = new bootstrap.Popover(document.querySelector(`#question_${db_data.words[word]['word_id']} [data-bs-toggle="popover"]`),
                                        {html: true,
                                         content: () => document.querySelector(`#qd_${db_data.words[word]['word_id']}`).outerHTML,
                                         customClass: 'bg-secondary-subtle shadow'})
            return () => popover.hide()
        }
    )
    

    return (<>
            <div id={`question_${db_data.words[word]['word_id']}`}  key={db_data.words[word]['word_id']} className="card w-md-100 ms-2 shadow">
                <div className="card-body  d-flex flex-column">
                    <h5 className="card-title"></h5>
                    <button onClick={() => setShow(true)} type="button" className="btn btn-link ms-auto" data-bs-container="body">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                        </svg>
                    </button>
                    <p className="card-text">
                        {usage_begin}
                        <strong>
                            {success
                            ? 
                            <span className='bg-success-subtle rounded'>{ctx}</span>
                                :
                                show
                                ?
                                <span className='bg-warning-subtle rounded'>{ctx}</span>
                            :
                            <input 
                                onInput={(e) => {
                                    let value = e.target.value
                                    if (value.length > ctx.length){
                                        setInputValue(value.slice(0, ctx.length))
                                    }
                                    if (value.length == ctx.length) {
                                        if (value.toLowerCase() == ctx.toLowerCase()) {
                                            setInputValue(value)
                                            setSuccess(true)
                                        }}
                                    else{
                                        setInputValue(value)
                                        }
                                    }
                                }
                                onFocus={(e) => {
                                    if (firstLetter && e.target.value.length == 0) {setInputValue(firstLetter)}
                                }}
                                className={`text-center bg-info-subtle border-0 rounded`}
                                size={ctx.length}
                                id={'quiz_' + db_data.words[word]['word_id']}
                                value={inputValue}
                                placeholder={firstLetter + '*'.repeat(ctx.length)}
                                style={{width: `${ctx.length * 12}px`}}
                                >
                            </input>
                            }
                        </strong>
                        {usage_end}
                    </p>
                    <p className="blockquote-footer mt-0">{use_record.current.book.title}</p>
                    <div className="mt-auto d-flex">
                        <button type="button" className="btn btn-link" onClick={() => {
                            setFirstLetter(ctx.slice(0, 1))
                            setInputValue('')
                        }}>First letter?</button>
                        <button type="button" className="btn btn-link ms-auto" data-bs-container="body"
                        data-bs-toggle="popover" data-bs-placement="bottom" data-bs-content="lol">
                             Show definition
                        </button>
                    </div>
                </div>
            </div>
            {
            ReactDOM.createPortal(<div id={`qd_${db_data.words[word]['word_id']}`}>
                {definitions.length ? definitions : 'No definition yet'}
                </div>, document.querySelector('#hidden'))
            }
        </>
    )
}