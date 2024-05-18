const etiCollapse = function (e) {
    const button = e.target;
    const selector = e.target.dataset.target;
    const target = document.querySelector(selector);
    const ex_window = document.querySelector(selector.replace('eti', 'ex'));
    const ex_button = document.querySelector(`[data-target="${selector.replace('eti', 'ex')}"]`)
    if (!target.classList.contains('open')) {
        ex_window &&  ex_window.classList.add('hide')
        ex_window && ex_window.classList.remove('open')
        ex_window && ex_button.classList.remove('active')
        target.classList.add('open')
        button.classList.add('active')
        target.classList.remove('hide')
        target.classList.add('open')
    } else {
        target.classList.remove('open')
        target.classList.remove('hide')
        setTimeout(() => ex_window &&  ex_window.classList.remove('hide'), 500)
        button.classList.remove('active')
    }
}


const exCollapse = function (e) {
    const button = e.target;
    const selector = e.target.dataset.target;
    const target = document.querySelector(selector);
    const eti_window = document.querySelector(selector.replace('ex', 'eti'));
    const eti_button = document.querySelector(`[data-target="${selector.replace('ex', 'eti')}"]`)
    if (!target.classList.contains('open')) {
        eti_window && eti_window.classList.add('hide')
        eti_window && eti_window.classList.remove('open')
        eti_window && eti_button.classList.remove('active')
        target.classList.add('open')
        button.classList.add('active')
        target.classList.remove('hide')
    } else {
        target.classList.remove('open')
        target.classList.remove('hide')
        setTimeout(() => eti_window && eti_window.classList.remove('hide'), 500)
        button.classList.remove('active')
    }
}


export const word_count_element = document.querySelector('#word_count')

export const Card = React.memo(function ({rec_name, to_show, d}) {
    console.log('rendering card')
    // console.log('rec_name', rec_name)
    // console.log('book_names', book_names)
    // console.log('to_show', to_show)
    // const [cardData, setCardData] = React.useState(db_data.words[rec_name])
    const cardData = db_data.words[rec_name]
    const rec_idx = cardData["word_id"]

    
    let usages = [];
    let definitions = [];
    let eties = []; // etymologies
    let examples = [];
    cardData.usages.map((use_record, use_idx) => {
        let context = use_record.context;
        let usage = use_record.usage;
        let index = usage.indexOf(context);
        let usage_begin = usage.substring(0, index);
        let usage_highlight = usage.substring(index, index + context.length);
        let usage_end = usage.substring(index + context.length)
        usages.push(
            <li key={use_idx}>
                <p>{usage_begin}<strong>{usage_highlight}</strong>{usage_end}</p>
                <p className="blockquote-footer">(
                    <span key={1} className="book_title">{use_record.book.title}</span>{', '}
                    <span key={2} className="book_authors">{use_record.book.authors}</span>
                    )
                </p>
            </li>
        )
    })
    cardData.definitions.map((def_record, def_idx) => {
        definitions.push(
            <li key={def_idx}>
                { def_record.sense_definition }
            </li>
        )
    })
    cardData.etymologies.map((eti_record, eti_idx) => {
        eties.push(
            <div key={eti_idx}>
                <p key={1}>
                    <strong>{ eti_record.part_of_sppech }</strong>
                </p>
                <p key={2}>
                    { eti_record.etymology }
                </p>
            </div>
        )
    })
    cardData.examples.map((ex_record, ex_idx) => {
        examples.push(
            <li key={ex_idx}>
                { ex_record }
            </li>
        )
    })

    return (
        <div key={rec_idx} id={`cards_${rec_idx}`} className={`word_card_container flex-md-column flex-lg-row d-flex ${to_show ? '' : 'hide'} ${cardData['failed'] ? 'failed' : ''}`}
                data-word_id={rec_idx} data-word={rec_name} data-defined={definitions.length ? "true" : "false"}
                // onClick={() => setCardData(db_data['words'][rec_name])}
                >
            <span id={`anchor_${rec_idx}`} className="anchor"></span>
            <div key={1} className="word_card shadow col-md-12 col-lg-6 border rounded-2">
                <h3 className = "text-center" key="name">{rec_name}</h3>
                <em><p className = "text-center" key="pronunciation">{cardData['pron']}</p></em>
                <ul key="usages">
                    { usages }
                </ul>
            </div>
            { cardData['loading']
                ?
                <div key={2} className="word_card shadow col-md-12 col-lg-6 flex-grow-0 border rounded-2 d-flex align-items-center">
                    <div className="d-flex justify-content-center container-fluid"><div className="spinner-border" role="status"></div></div>
                </div> 
                :
                <div key={2} className="word_card shadow col-md-12 col-lg-6 flex-grow-0 border rounded-2 d-flex flex-column justify-content-center">
                        
                    <ul key={1} className="align-self-center">
                        { definitions }
                    </ul>
                    
                    <div key={2} className="container d-flex justify-content-center">
                        <div className="container d-flex justify-content-center">
                        <div key={1}>
                            <button onClick = {etiCollapse} className="btn btn-primary word_card_button" type="button" data-target={`#eti_${rec_idx}`} disabled={!eties.length} >
                                Etymology
                            </button>
                        </div>
                        <div key={2}>
                            <button onClick = {exCollapse} className="btn btn-primary word_card_button" type="button" data-target={`#ex_${rec_idx}`} disabled={!examples.length}>
                                Examples
                            </button>
                        </div>
                        </div>
                        {
                            definitions.length === 0 
                            ?
                            <div key={3}>
                                <button onClick = {() => fetch_definition(rec_name, rec_idx)} className="btn btn-secondary word_card_button" type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/></svg>
                                </button>
                            </div>
                            :
                                null
                        }
                    </div>
                    <div key={3} className="container d-flex justify-content-center">
                        {eties.length > 0 ?
                        <div key={1} className="word_collapse" id={`eti_${rec_idx}`}>
                            <div className="card card-body">
                                {eties}
                            </div>
                        </div>
                        : null}
                        {examples.length > 0 ?
                        <div key={2} className="word_collapse" id={`ex_${rec_idx}`}>
                            <div className="card card-body">
                                {examples}
                            </div>
                        </div>
                        : null} 
                    </div>
                </div>
            }
            
        </div>)

}
)


const csrftoken = Cookies.get('csrftoken')

export const fetch_definition = function (word, word_id) {
    if (!word && !auto_search.checked) {
        setTimeout(fetch_definition, 300);
        return
    }

    const options = {
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin'
    }

    let query_data;
    if (!word) {
        const undef_word = document.querySelector('.word_card_container[data-defined="false"]:not(.hide):not(.failed)');
        if (!undef_word) {
            document.querySelector('#loading_message').innerHTML = ''
            setTimeout(fetch_definition, 300);
            return
        }
        query_data = undef_word.dataset
    } else {
        query_data = { word, word_id }
    }
    console.log('qury_data', query_data)
    
    const start_event = new Event('definition_received')
    start_event.details = {'word': query_data['word'], 'loading': true}
    document.querySelector('#root').dispatchEvent(start_event)
    document.querySelector('#loading_message').innerHTML = `loading <a href="#cards_${query_data['word_id']}">${query_data['word']}<a>`
    
    const formData = new FormData();
    formData.append('word', query_data['word'])
    formData.append('word_id', query_data['word_id'])
    formData.append('db_name', db_name)
    options['body'] = formData;
    fetch(word_def_url, options)
    .then(response => response.json())
    .then(data => {
        const event = new Event('definition_received')
        event.details = data
        document.querySelector('#root').dispatchEvent(event)
      if (!word) {
            console.log('delaying')
            setTimeout(fetch_definition, 300)
        } else {
            console.log('returning')
            // document.querySelector('#loading_message').innerHTML = ''
            return
        }
    })
    .catch(
        (error) => {
            console.log(error)
            if (!word && auto_search.checked) {
                setTimeout(fetch_definition, 1000)
            } else {
                document.querySelector('#loading_message').innerHTML = ''
                setTimeout(fetch_definition, 300)
            }
        }
    )
    
}

export const auto_search = document.querySelector("#auto_search");
auto_search.addEventListener('change', (e) => {
    // console.log('CHANGE')
})
