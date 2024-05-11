'use strict;'

const db_data = initial_table_data;
const orig_keys = Object.keys(db_data.words)


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


function Card(rec_name, rec_data, rec_idx, book_names) {
    const [cardData, setCardData] = React.useState(rec_data)
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
    const word_counter = document.querySelector('#word_count');
    word_counter.innerHTML = (parseInt(word_counter.innerHTML) || 0) + usages.length
    return (
        <div key={rec_idx} id={`cards_${rec_idx}`} className="word_card_container container d-flex">
            <div key={1} className="word_card col-6 border rounded-2">
                <h3 className = "text-center" key="name">{rec_name}</h3>
                <em><p className = "text-center" key="pronunciation">{cardData['pron']}</p></em>
                <ul key="usages">
                    { usages }
                </ul>
            </div>
            <div key={2} className="word_card col-6 border rounded-2">
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
        </div>)

}


function DataTable( {data, books, book_authors} ) {

    const [keys, setKeys] = React.useState(Object.keys(data))
    const [book_names, setBooks] = React.useState(books);
    
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


    document.querySelector('#word_count').innerHTML = 0;
    return (
    <div className="container">
        {
            keys.map((rec_name, rec_idx) => {
                const rec_data = data[rec_name];
                return Card(rec_name, rec_data, rec_idx, book_names) }
                )
        }
    </div>)
}


ReactDOM.render(
    <DataTable data={db_data.words} books={db_data.books} book_authors={db_data.book_authors} />,
    document.getElementById("root")
);
