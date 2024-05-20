import { ABC_asc, ABC_desc } from "./vars";
import { Card, word_count_element, fetch_definition, auto_search } from "./components/card.js"

// const db_data = initial_table_data;
const search_field = document.querySelector("#search_field");
const defined_word_count = document.querySelector('#defined_words_count')
const failed_word_count = document.querySelector('#failed_words_count')
const download_button = document.querySelector('#dowload_button')
const modal_progress_success = document.querySelector('#modal_progress_success')
const modal_progress_failed = document.querySelector('#modal_progress_failed')

const modal_progress_bar = document.querySelector('#modal_progress')
const modal_progress_bar_tooltip = new bootstrap.Tooltip(modal_progress_bar)

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
        if (export_modal.style.display !== 'none') {
            count_words_to_export()
        }
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

    React.useEffect(() => {     // search and book filer setup
        const no_results = document.querySelector('#no_results');
        const displayed = document.querySelectorAll('.word_card_container:not(.hide)')
        if (!displayed.length) {
            no_results.style.display = 'block'
        } else {
            no_results.style.display = 'none'
        }
        word_count_element.innerHTML = displayed.length
    }, [search, book_names])

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
        word_count_element.innerHTML = counter
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
        console.log('received_definition trigger')
        setBigData(structuredClone(db_data.words))
        if (export_modal.style.display !== 'none') {
            count_words_to_export()
        }
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

    return (
    <div className="container">
        {
            keys.map((rec_name) => {
                let to_show = search !== '' ? rec_name.search('^' + search, 'i') !== -1 : true
                if (to_show) {
                    const usage_books = []
                    for (let us of db_data.words[rec_name].usages) {
                        if (book_names.includes(us.book.title)) {
                            usage_books.push(us.book.title)
                        }
                    }
                    if (!usage_books.length) {
                        to_show = false
                    }
                }
                return <Card key={db_data.words[rec_name]['word_id']} rec_name={rec_name} to_show={to_show}
                             d={JSON.stringify(db_data.words[rec_name])} 
                              />
            }
            )   
        }
    </div>
    )
}


ReactDOM.render(
    <DataTable books={db_data.books} />,
    document.getElementById("root")
);


const mybutton = document.getElementById("btn-back-to-top");
const search_form = document.querySelector("#search");
const export_modal = document.querySelector("#export_modal");


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



function arrayToTsv(data){
    return data.map(row =>
      row
      .map(String)  // convert every value to String
      .map(v => v.replaceAll('"', '""'))  // escape double quotes
      .map(v => `"${v}"`)  // quote it
      .join('\t')  // tab-separated
    ).join('\r\n');  // rows starting on new lines
  }


const count_words_to_export = function() {
    let only_defined;
    if (!document.querySelector('#only_defined').checked) {
        only_defined = false
    } else {
        only_defined = true;
    }
    let query = `.word_card_container:not(.hide)`
    const modal_summary = document.querySelector('#form_summary')
    let cards = document.querySelectorAll(query)

    const unique_books = new Set();
    let defined = 0
    let failed = 0
    for (const card of cards) {
        if (!only_defined) {
            unique_books.add(card.querySelector('.book_title').textContent)
        }
        if (card.dataset.defined == 'true') {
            if (only_defined) {
                unique_books.add(card.querySelector('.book_title').textContent)
            }
            defined += 1
        } else if (card.classList.contains('failed')) {
            failed += 1
        }
        
    }

    update_modal_progress(cards.length, failed, defined)

    modal_summary.innerHTML = `<p>Download ${only_defined ? defined :cards.length} words for ${unique_books.size} books</p>`

    query = `.word_card_container${only_defined ? '[data-defined="true"]:not(.failed)' : ''}:not(.hide)`
    
    cards = document.querySelectorAll(query)
    const tsv_data_total = []
    for (const card of cards) {
        const tsv_data = [];
        const card_data = db_data['words'][card.dataset.word]
        if (!card_data) continue;
        tsv_data.push(card.dataset.word)
        tsv_data.push(card_data['pron'])

        tsv_data_total.push(tsv_data)
    }
    const content = arrayToTsv(tsv_data_total)
    const blob = new Blob([content], {type: 'text/csv;charset=utf-8'})
    const url = URL.createObjectURL(blob);

    // const a = document.createElement("a");
    // console.log(url)
    // a.href = url;
    // a.download = 'vocab.tsv'
    // a.click()
}

const update_modal_progress = function(total, failed, defined) {
    console.log(defined, failed, total)
    modal_progress_success.querySelector('div').innerHTML = defined
    modal_progress_success.style.width = Math.floor(defined / total * 100) + '%'
    
    modal_progress_failed.querySelector('div').innerHTML = failed
    modal_progress_failed.style.width = Math.ceil(failed / total * 100) + '%'
    modal_progress_bar_tooltip.setContent({'.tooltip-inner': `${defined} defined, ${failed} failed out of ${total} words`})
}

export_modal.addEventListener('show.bs.modal', count_words_to_export)

// download_button.addEventListener('click', () => {
//     const only_defined = document.querySelector('#only_defined').checked;
//     const query = `.word_card_container${only_defined ? '[data-defined="true"]:not(.failed)' : ''}:not(.hide)`
//     const cards = document.querySelectorAll(query)
//     console.log(cards)
//     const csv_data_total = []
//     for (const card of cards) {
//         const csv_data = [];
//         const card_data = db_data['words'][card.dataset.word]
//         if (!card_data) continue;
//         csv_data.push(card.dataset.word)
//         csv_data.push(card_data['pron'])

//     }
//     console.log(csv_data_total)
// })

document.querySelector('#only_defined').addEventListener('change', count_words_to_export)
document.querySelectorAll('#book_container .form-check').forEach(
    el => {
        console.log('here')
        el.addEventListener('mouseenter', e => e.target.classList.add('bg-primary-subtle'))
        el.addEventListener('mouseleave', e => e.target.classList.remove('bg-primary-subtle'))
    }
)
document.querySelector('#search_clear').addEventListener('click', () => 
    {search_field.value = '';
     search_field.dispatchEvent(new Event('change'))
    })

fetch_definition()


const popoverTrigger = document.querySelector('[data-bs-toggle="popover"]')
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

