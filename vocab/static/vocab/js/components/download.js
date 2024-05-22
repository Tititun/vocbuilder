import React from "react"


function arrayToCsv(data, separator){
    return data.map(row =>
      row
      .map(String)  // convert every value to String
      .map(v => v.replaceAll('"', '""'))  // escape double quotes
      .map(v => `"${v}"`)  // quote it
      .join(separator)  // tab-separated
    ).join('\r\n');  // rows starting on new lines
  }


function fieldsReducer(state, action) {
    switch (action.field) {
        case 'pronunciation':
            return {
                ...state,
                pronunciation: !state.pronunciation
            }
        case 'definitions':
            return {
                ...state,
                definitions: !state.definitions
            }
        case 'etymology':
            return {
                ...state,
                etymology: !state.etymology
            }
        case 'usages':
            return {
                ...state,
                usages: !state.usages
            }
    }

} 


export const Download = function({unique_books, all_books, show_count, show_defined_count, failed_count}) {
    console.log('rendering download')
    const [is_only_defined, setIsOnlyDefined] = React.useState(true) 
    const [fields, setFields] = React.useReducer(fieldsReducer, {
            pronunciation: true, definitions: true, etymology: true, usages: true})
    const [format, setFormat] = React.useState('tsv')

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

    const download = () => {
        const csv_data_total = []
        for (const [word, data] of Object.entries(db_data.words)) {
            if (is_only_defined && !data.definitions.length) continue;
            
            const usages = data.usages.filter(u => all_books.includes(u.book.title))
            if (!usages.length) continue;

            let such_as, last_letter;
            const csv_data = [word]
            if (fields['pronunciation']) {
                csv_data.push(data['pron'])
            }
            if (fields['definitions']) {
                csv_data.push(
                    data.definitions.map((d, idx) => {
                        if (d.sense_definition.endsWith('such as')) {such_as=true; last_letter='a'}
                        if (such_as && d.letter && idx != 0) {
                            if (last_letter > d.letter) {such_as=false; return d.sense_definition}
                            last_letter = d.letter;
                            return ' ' + d.letter + ') ' + d.sense_definition
                        }
                        if (!d.letter & !(d.sense_definition.endsWith('such as'))) {such_as=false}
                        return d.sense_definition
                    }).join('\n') 
                )
            }
            if (fields['etymology']) {
                csv_data.push(
                    data.etymologies.map(e => e.etymology).join('\n'),
                )
            }
            if (fields['usages']) {
                csv_data.push(data.usages.map(u => `${u.usage}\n${u.book.title}\n${u.book.authors}`).join('\n\n'))
            }
            csv_data_total.push(csv_data)
        }
        
        let output;
        if (format === 'csv') {
            output = arrayToCsv(csv_data_total, ',')
        } else {
            output = arrayToCsv(csv_data_total, '\t')
        }
        const blob = new Blob([output], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const pom = document.createElement('a');
        pom.href = url;
        pom.setAttribute('download', `vocab.${format}`);
        pom.click();
    }

    return (
        <div className="modal fade" id="export_modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
            <div className="modal-header d-flex justify-content-center">
                <div className="w-100 text-center"><h1 className="modal-title fs-5" id="exampleModalLabel">Download</h1></div>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body">
                <div>
                    <form>
                     <input type="hidden" name="csrfmiddlewaretoken" value={Cookies.get('csrftoken')} />
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="only_defined" 
                                   onChange={() => setIsOnlyDefined(!is_only_defined)} checked={is_only_defined} />
                            <label className="form-check-label" for="only_defined">
                                Include only words with definitions
                            </label>
                        </div>
                        <hr className="my-2"></hr>
                        <p className="mb-1 ms-4"><strong>Fields</strong></p>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="d_pronunciation"
                                checked={fields['pronunciation']} onChange={() => setFields({field: 'pronunciation'})} />
                            <label className="form-check-label" for="d_pronunciation">
                                pronunciation
                            </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="d_definitions"
                                checked={fields['definitions']} onChange={() => setFields({field: 'definitions'})} />
                            <label className="form-check-label" for="d_definitions">
                            definitions
                            </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="d_etymology"
                                checked={fields['etymology']} onChange={() => setFields({field: 'etymology'})} />
                            <label className="form-check-label" for="d_etymology">
                                etymology
                            </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="d_usages"
                                checked={fields['usages']} onChange={() => setFields({field: 'usages'})} />
                            <label className="form-check-label" for="d_usages">
                                usage
                            </label>
                        </div>

                        <hr className="my-2"></hr>
                        <p className="mb-1 ms-4"><strong>Format</strong></p>
                        <div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="flexRadioDefault" id="tsv"
                                checked={format == 'tsv'} onChange={() => setFormat('tsv')} />
                                <label className="form-check-label" for="tsv">
                                    tsv
                                </label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="flexRadioDefault" id="csv"
                                checked={format == 'csv'} onChange={() => setFormat('csv')} />
                                <label className="form-check-label" for="flexRcsvadioDefault1">
                                    csv
                                </label>
                            </div>
                            {/* <div className="form-check">
                                <input className="form-check-input" type="radio" name="flexRadioDefault" id="json" 
                                checked={format == 'json'} onChange={() => setFormat('json')} />
                                <label className="form-check-label" for="json">
                                    json
                                </label>
                            </div> */}
                        </div>



                    </form>
                </div>
                <div id="modal_progress" className="progress-stacked mt-3" data-bs-toggle="tooltip" data-bs-title="progress">
                    <div className="progress" role="progressbar" id="modal_progress_success"
                     style={{width: `${Math.floor(show_defined_count / show_count * 100)}%`}}>
                    <div className="progress-bar bg-success">{show_defined_count}</div>
                    </div>
                    <div className="progress ms-auto" role="progressbar" id="modal_progress_failed"
                     style={{width: `${Math.ceil(failed_count / show_count * 100)}%`}}>
                    <div className="progress-bar bg-danger">{failed_count}</div>
                    </div>
                </div>
            </div>
            <div className="modal-footer d-flex justify-content-end">
                    <p id="form_summary" className="text-start me-auto">
                        {`Download ${is_only_defined? show_defined_count : show_count} 
                         words for ${is_only_defined? unique_books.size : all_books.length} books`}
                    </p>
                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Close</button>
                <button type="button" className="btn btn-success" id="dowload_button" onClick={download}>Download</button>
            </div>
            </div>
        </div>
        </div>
    )

}