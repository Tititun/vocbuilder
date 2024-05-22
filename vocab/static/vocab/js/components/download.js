import React from "react"


export const Download = function({unique_books, all_books, show_count, show_defined_count, failed_count}) {
    console.log('rendering download')
    console.log(show_count, show_defined_count, failed_count)
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

    React.useEffect(() => {
        myTooltip && myTooltip.current.setContent({'.tooltip-inner': `${show_defined_count} defined, ${failed_count} failed out of ${show_count} words`})
    }, [show_count, show_defined_count, failed_count])

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
                        {`Download ${is_only_defined? show_defined_count : show_count} 
                         words for ${is_only_defined? unique_books.size : all_books.length} books`}
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
                    <div class="progress" role="progressbar" id="modal_progress_success"
                     style={{width: `${Math.floor(show_defined_count / show_count * 100)}%`}}>
                    <div class="progress-bar bg-success">{show_defined_count}</div>
                    </div>
                    <div class="progress ms-auto" role="progressbar" id="modal_progress_failed"
                     style={{width: `${Math.ceil(failed_count / show_count * 100)}%`}}>
                    <div class="progress-bar bg-danger">{failed_count}</div>
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