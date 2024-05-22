import { ABC_asc, ABC_desc } from "./vars";
import { Card, fetch_definition } from "./components/card.js"
import { Quiz } from "./components/quiz.js";
import { Download } from "./components/download.js";
import React from 'react';
import ReactDOM from 'react-dom'

const auto_search = document.querySelector("#auto_search");
const search_field = document.querySelector("#search_field");
const defined_word_count = document.querySelector('#defined_words_count')
const failed_word_count = document.querySelector('#failed_words_count')

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


function DataTable( {books} ) {
    console.log('table rendering')

    const [bigData, setBigData] = React.useState(db_data.words)
    const [book_names, setBooks] = React.useState(books);
    const [sorted, setSorted] = React.useState(null)
    const [search, setSearch] = React.useState('')
    
    React.useEffect(() => {     // callbacks and word counters setup
        bookCheckCallback()
        document.querySelector('#word_sort').addEventListener('click', wordSortCallback)
        document.querySelectorAll('.book_check').forEach(el => el.addEventListener('change', bookCheckCallback))
        document.querySelector('#root').addEventListener('definition_received', received_definition)
        search_field.addEventListener('input', get_value)
        search_field.addEventListener('change', get_value_change)
        
        defined_word_count.innerHTML = db_data.defined_words_count;
        failed_word_count.innerHTML = db_data.failed_count;

        document.querySelector('#words_count').innerHTML = db_data.words_count
        document.querySelectorAll('.progress_counter').forEach(el => el.style.visibility = 'visible')

        return () => {
            document.querySelector('#word_sort').removeEventListener('click', wordSortCallback)
            document.querySelectorAll('.book_check').forEach(el => el.removeEventListener('change', bookCheckCallback))
            document.querySelector('#root').removeEventListener('definition_received', received_definition)
            search_field.removeEventListener('input', get_value)
            search_field.removeEventListener('change', get_value_change)
    }
    }, [])

    const wordSortCallback = (e) => {
        let button = e.target;
        let order = button.dataset.order;
        if (button.classList.contains('btn-light')) {
            button.classList.remove('btn-light');
            button.classList.add('btn-primary');
            button.innerHTML = ABC_asc + 'Word sort';
            setSorted('ascending')
        } else if (order === 'ascending') {
            button.dataset.order = 'descending';
            button.innerHTML = ABC_desc + 'Word sort';
            setSorted('descending')
        } else {
            button.classList.remove('btn-primary');
            button.classList.add('btn-light');
            button.innerHTML = 'Word sort';
            button.dataset.order = 'ascending';
            setSorted(null)
        }
    }

    const bookCheckCallback = () => {
        const new_books = [];
        let counter = 0;
        for (let el of document.querySelectorAll('.book_check')) {
            const book_name = el.value;
            const checked = el.checked;
            if (checked) {
                new_books.push(book_name)
                counter += db_data.books_count[book_name]
            }
        }
        setBooks(new_books)
    }

    const received_definition = (e) => {
        const word = e.details['word']
        const word_data = db_data.words[word]
        if (e.details['loading']) {
            word_data['loading'] = true;
        } else if (e.details['failed']) {
            if (!word_data['failed']) {
                db_data.failed_count += 1
                word_data['failed'] = true;
                failed_word_count.innerHTML = db_data.failed_count
            }
            word_data['loading'] = false;
        } else {
            for (const key of ['failed', 'definitions', 'pron', 'etymologies', 'examples', 'loading']) {
                word_data[key] = e.details[key]
            }
            if (!e.details.failed) {
                db_data.defined_words_count += 1
                defined_word_count.innerHTML = db_data.defined_words_count
            }
        }
        db_data.words[word] = word_data
        setBigData(structuredClone(db_data.words))

        if (!e.details['loading']) 
            {
                const loading_msg = `${e.details.failed ? "failed" : "loaded"} <a href="#anchor_${e.details.word_id}">${e.details.word}</a>`
                document.querySelector('#loading_message').innerHTML = loading_msg
            }
    } 
    
    var timer;
    const get_value = (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => setSearch(e.target.value), 250)
    }; 

    const get_value_change = (e) => {
        clearTimeout(timer);
        setSearch(e.target.value)
    }; 

    let keys;
    switch(sorted){
        case 'ascending':
            keys = Object.keys(db_data.words).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            break
        case 'descending':
            keys = Object.keys(db_data.words).sort((a, b) => b.toLowerCase().localeCompare(a.toLowerCase()))
            break
        default:
            keys = Object.keys(db_data.words)
    }
    let show_count = 0;
    let show_defined_count = 0;
    let failed_count = 0;
    const unique_books = new Set();
    return (
    <div className="container">
        {   keys.map((rec_name) => {
                let to_show = search !== '' ? rec_name.search('^' + search, 'i') !== -1 : true
                if (to_show) {
                    const usage_books = []
                    for (let us of db_data.words[rec_name].usages) {
                        if (book_names.includes(us.book.title)) {
                            usage_books.push(us.book.title)
                            if (db_data.words[rec_name].definitions.length) {
                                unique_books.add(us.book.title)
                            }
                        }
                    }
                    if (!usage_books.length) {
                        to_show = false
                    }
                    if (to_show) {
                            show_count++
                            if (db_data.words[rec_name].failed) {
                                failed_count++
                            }
                            if (db_data.words[rec_name].definitions.length) {
                                show_defined_count++
                        }
                    }
                }
                return <Card key={db_data.words[rec_name]['word_id']} rec_name={rec_name} to_show={to_show}
                             setBigData={setBigData} d={JSON.stringify(db_data.words[rec_name])} />
            }
            ) 
             
        }
        {!show_count ? <div id="no_results" class="text-center"><h3>No words matching selected filters</h3></div> :null}
        <Quiz/>
        <Download unique_books={unique_books} all_books={book_names} show_count={show_count} show_defined_count={show_defined_count} failed_count={failed_count} />    
        {ReactDOM.createPortal(<span>{show_count}</span>,
                            document.querySelector('#word_count_holder'))}
        </div>
    )
}


ReactDOM.render(    
    <DataTable books={db_data.books} />,
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
    auto_search.checked = false
    this.document.querySelectorAll('.book_check').forEach( el => {
        el.checked = true;   
    })
  });


document.querySelectorAll('#book_container .form-check').forEach(
    el => {
        el.addEventListener('mouseenter', e => e.target.classList.add('bg-primary-subtle'))
        el.addEventListener('mouseleave', e => e.target.classList.remove('bg-primary-subtle'))
    }
)
document.querySelector('#search_clear').addEventListener('click', () => 
    {search_field.value = '';
     search_field.dispatchEvent(new Event('change'))
    })

fetch_definition()


const popoverTrigger = document.querySelector('.progress_counter [data-bs-toggle="popover"]')
const popover = new bootstrap.Popover(popoverTrigger, {trigger: 'focus', sanitize: false, html: true})

document.querySelector('#failed_popover').addEventListener('show.bs.popover', () => {
    let content = '<div id="failed_popover_body">'
        for (let word of Object.keys(db_data.words)) {
            let data = db_data.words[word]
            if (data.failed) {
                content += `<a class="text-dark" href="#anchor_${data['word_id']}"><strong>${word}</strong></p>`
            }
        }
        content += '</div>'
    popover.setContent(  {
        '.popover-body': content}
    )
})
