'use strict;'

const db_data = initial_table_data;
const orig_keys = Object.keys(db_data.words)
const search_field = document.querySelector("#search_field");
const word_count_element = document.querySelector('#word_count')
var Socket;


const etiCollapse = function (e) {
    const button = e.target;
    const selector = e.target.dataset.target;
    const target = document.querySelector(selector);
    if (target.style.display == 'block') {
        target.style.display = 'none'
        button.classList.remove('active')
    } else {
        const ex_window = document.querySelector(selector.replace('eti', 'ex'));
        if (ex_window && ex_window.style.display === 'block') {
             let ex_button = document.querySelector(`[data-target="${selector.replace('eti', 'ex')}"]`)
             ex_button.classList.remove('active')
             ex_window.style.display = 'none'
            }
        button.classList.add('active')
        target.style.display = 'block'
    }
}

const exCollapse = function (e) {
    const button = e.target;
    const selector = e.target.dataset.target;
    const target = document.querySelector(selector);
    if (target.style.display == 'block') {
        target.style.display = 'none'
        button.classList.remove('active')
    } else {
        const eti_window = document.querySelector(selector.replace('ex', 'eti'));
        if (eti_window && eti_window.style.display === 'block') {
            let eti_button = document.querySelector(`[data-target="${selector.replace('ex', 'eti')}"]`)
            eti_button.classList.remove('active')
            eti_window.style.display = 'none'
        }
        button.classList.add('active')
        target.style.display = 'block'
    }
}

document.querySelector('#book_clear').addEventListener('click', (e) => {
    document.querySelectorAll('.book_check').forEach(el => {
        el.checked = false;
    })
    document.querySelector('.book_check').dispatchEvent(new Event('change'))
})

document.querySelector('#book_select').addEventListener('click', (e) => {
    document.querySelectorAll('.book_check').forEach(el => {
        el.checked = true;
    })
    document.querySelector('.book_check').dispatchEvent(new Event('change'))
})


function Card(rec_name, rec_data, book_names, to_show) {
    const [cardData, setCardData] = React.useState(rec_data)
    const rec_idx = cardData["word_id"]

    // const cardData = rec_data;
    React.useEffect(() => {setCardData(rec_data)}, [rec_data])
    
    let usages = [];
    let definitions = [];
    let eties = []; // etymologies
    let examples = [];
    cardData.usages.map((use_record, use_idx) => {
        if (!(book_names.includes(use_record.book.title))) return
        let context = use_record.context;
        let usage = use_record.usage;
        let index = usage.indexOf(context);
        let usage_begin = usage.substring(0, index);
        let usage_highlight = usage.substring(index, index + context.length);
        let usage_end = usage.substring(index + context.length)
        usages.push(
            <li key={use_idx}>
                {usage_begin}<strong>{usage_highlight}</strong>{usage_end} 
                <em>(
                    <span key={1} className="book_title">{use_record.book.title}</span>{', '}
                    <span key={2} className="book_authors">{use_record.book.authors}</span>
                    )
                </em>
            </li>
        )
    })
    if (!usages.length) return
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

    if (to_show) {
        word_count_element.innerHTML = (parseInt(word_count_element.innerHTML) || 0) + usages.length
    }
    return (
        <div key={rec_idx} id={`cards_${rec_idx}`} className={`word_card_container container d-flex ${to_show ? '' : 'hide'} ${cardData['failed'] ? 'failed' : ''}`}
                data-word_id={rec_idx} data-word={rec_name} data-defined={definitions.length ? "true" : "false"}
                // onClick={() => setCardData(db_data['words'][rec_name])}
                >
            <div key={1} className="word_card shadow col-6 border rounded-2">
                <h3 className = "text-center" key="name">{rec_name}</h3>
                <em><p className = "text-center" key="pronunciation">{cardData['pron']}</p></em>
                <ul key="usages">
                    { usages }
                </ul>
            </div>
            { cardData['loading']
                ?
                <div key={2} className="word_card shadow col-6 border rounded-2 d-flex align-items-center">
                    <div className="d-flex justify-content-center container-fluid"><div className="spinner-border" role="status"></div></div>
                </div> 
                :
                <div key={2} className="word_card shadow col-6 border rounded-2">
                    <ul key={1}>
                        { definitions }
                    </ul>
                    <div key={2} className="container d-flex">
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
                    <div key={3} className="container d-flex">
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


function DataTable( {books, book_authors} ) {

    const [bigData, setBigData] = React.useState(db_data.words)
    const [keys, setKeys] = React.useState(Object.keys(bigData))
    const [book_names, setBooks] = React.useState(books);
    const [search, setSearch] = React.useState('')
    
    const wordSortCallback = (e) => {
        let button = e.target;
        let order = button.dataset.order;
        if (button.classList.contains('btn-light')) {
            button.classList.remove('btn-light');
            button.classList.add('btn-primary');
            button.innerHTML = ABC_asc + 'Word sort';
            let new_keys = keys.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            setKeys([...new_keys]);
        } else if (order === 'ascending') {
            button.dataset.order = 'descending';
            button.innerHTML = ABC_desc + 'Word sort';
            let new_keys = keys.sort((a, b) => b.toLowerCase().localeCompare(a.toLowerCase()))
            setKeys([...new_keys]);
        } else {
            button.classList.remove('btn-primary');
            button.classList.add('btn-light');
            button.innerHTML = 'Word sort';
            button.dataset.order = 'ascending';
            setKeys([...orig_keys]);
        }
    }

    const bookCheckCallback = () => {
        const new_books = [];
        for (let el of document.querySelectorAll('.book_check')) {
            const book_name = el.value;
            const checked = el.checked;
            if (checked) {new_books.push(book_name)}
        }
        setBooks(new_books)
    }

    React.useEffect(() => {
        document.querySelector('#word_sort').addEventListener('click', wordSortCallback)
        document.querySelectorAll('.book_check').forEach(el => el.addEventListener('change', bookCheckCallback))
        return () => {
            document.querySelector('#word_sort').removeEventListener('click', wordSortCallback)
            document.querySelectorAll('.book_check').forEach(el => el.removeEventListener('change', bookCheckCallback))
    }
    }, [])


    const received_definition = (e) => {
        console.log('inside')
        const word = e.details['word']
        console.log(word)
        const new_data = JSON.parse(JSON.stringify(db_data))
        if (e.details['loading']) {
            new_data['words'][word]['loading'] = true;
        } else {
            for (const key of ['failed', 'definitions', 'pron', 'etymologies', 'examples', 'loading']) {
                new_data['words'][word][key] = e.details[key]
            }
        }
        db_data['words'][word] = new_data['words'][word]
        setBigData(new_data.words)
    } 
    React.useEffect(() => {
        document.querySelector('#root').addEventListener('definition_received', received_definition)
        return () => {
            document.querySelector('#root').removeEventListener('definition_received', received_definition)
}
    }, [])

    var timer;
    const get_value = (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => setSearch(e.target.value), 250)
    }; 

    const get_value_change = (e) => {
        clearTimeout(timer);
        setSearch(e.target.value)
    }; 

    React.useEffect(() => {
        search_field.addEventListener('input', get_value)
        search_field.addEventListener('change', get_value_change)
        return () => {
            search_field.removeEventListener('input', get_value)
            search_field.removeEventListener('change', get_value_change)
    }}, [])

    word_count_element.innerHTML = 0;
    
    window.dispatchEvent(new Event('socket_trigger'))
    return (
    <div className="container">
        {
            keys.map((rec_name) => {
                const rec_data = bigData[rec_name];
                const to_show = search !== '' ? rec_name.search('^' + search, 'i') !== -1 : true
                return Card(rec_name, rec_data, book_names, to_show)
            }
        )
    }
    </div>)
}


ReactDOM.render(
    <DataTable books={db_data.books} book_authors={db_data.book_authors} />,
    document.getElementById("root")
);


const mybutton = document.getElementById("btn-back-to-top");
const search_form = document.querySelector("#search");

mybutton.addEventListener('click', () => {
    document.documentElement.scrollTop = 0;
})

window.onscroll = () => {
    if (
        window.scrollY > 300
      ) {
        mybutton.style.display = "block";
      } else {
        mybutton.style.display = "none";
      }
};


search_form.addEventListener('submit', (e) => {
    e.preventDefault();
})


window.addEventListener('unload', function(event) {
    search_field.value = "";
    this.document.querySelectorAll('.book_check').forEach( el => {
        el.checked = true;   
    })
  });



const csrftoken = Cookies.get('csrftoken');
const fetch_definition = function () {
    const options = {
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin'
    }
    const undef_word = document.querySelector('.word_card_container[data-defined="false"]:not(.hidden):not(.failed)');
    if (!undef_word) {
        setTimeout(fetch_definition, 300);
        return
    }
    const start_event = new Event('definition_received')
    start_event.details = {'word': undef_word.dataset['word'], 'loading': true}
    document.querySelector('#root').dispatchEvent(start_event)
    const formData = new FormData();
    formData.append('word', undef_word.dataset['word'])
    formData.append('word_id', undef_word.dataset['word_id'])
    formData.append('db_name', db_name)
    options['body'] = formData;
    fetch(word_def_url, options)
    .then(response => response.json())
    .then(data => {
      const event = new Event('definition_received')
      event.details = data
      document.querySelector('#root').dispatchEvent(event)
      setTimeout(fetch_definition, 300)
    //   console.log(data)
    })
    
}

fetch_definition()
