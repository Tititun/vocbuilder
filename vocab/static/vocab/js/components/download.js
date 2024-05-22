import React from "react"

// modal_summary.innerHTML = `<p>Download ${only_defined ? defined :cards.length} words for ${unique_books.size} books</p>`

// const update_modal_progress = function(total, failed, defined) {
//     modal_progress_success.querySelector('div').innerHTML = defined
//     modal_progress_success.style.width = Math.floor(defined / total * 100) + '%'
    
//     modal_progress_failed.querySelector('div').innerHTML = failed
//     modal_progress_failed.style.width = Math.ceil(failed / total * 100) + '%'
//     modal_progress_bar_tooltip.setContent({'.tooltip-inner': `${defined} defined, ${failed} failed out of ${total} words`})
// }

export const Download = function({book_names, show_count, show_defined_count}) {
    console.log('rendering download')
    console.log(show_count, show_defined_count)
    const [is_only_defined, setIsOnlyDefined] = React.useState(true) 
    const myModal = React.useRef(0)
    const myTooltip = React.useRef(0)
    
    const export_button_link = document.querySelector('#export_button') 

    React.useEffect(() => {
        myModal.current = new bootstrap.Modal(document.querySelector('#export_modal'))
        myTooltip.current = new bootstrap.Tooltip(document.querySelector('#modal_progress'))
        const show_modal = (e) => {
            e.preventDefault();    
            myModal && myModal.current.show()
        }
        export_button_link.addEventListener('click', show_modal)
        return () => export_button_link.removeEventListener('click', show_modal)
    }, [])


    return (
        <div class="modal fade" id="export_modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header d-flex justify-content-center">
                <div class="w-100 text-center"><h1 class="modal-title fs-5" id="exampleModalLabel">Download</h1></div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
                <div>
                    <p id="form_summary">
                        {`Download ${is_only_defined? show_defined_count : show_count} words for ${book_names.size} books`}
                    </p>
                </div>
                <div>
                    <form>
                     <input type="hidden" name="csrfmiddlewaretoken" value={Cookies.get('csrftoken')} />
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="only_defined" 
                                   onChange={() => setIsOnlyDefined(!is_only_defined)} checked={is_only_defined} />
                            <label class="form-check-label" for="only_defined">
                                Include only words with definitions
                            </label>
                        </div>
                    </form>
                </div>
                <div id="modal_progress" class="progress-stacked mt-3" data-bs-toggle="tooltip" data-bs-title="progress">
                    <div class="progress" role="progressbar" id="modal_progress_success" style={{width: '50%'}}>
                    <div class="progress-bar bg-success"></div>
                    </div>
                    <div class="progress ms-auto" role="progressbar" id="modal_progress_failed" style={{width: '50%'}}>
                    <div class="progress-bar bg-danger"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-success" id="dowload_button">Download</button>
            </div>
            </div>
        </div>
        </div>
    )

}