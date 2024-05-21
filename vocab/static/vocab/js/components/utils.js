import React from "react";

export const composeDefinitions = function(definitions, with_tags=true) {
    const result = []
    let such_as = false;
    definitions.map((def_record, def_idx) => {
        let definition = def_record.sense_definition
        let letter = def_record.letter
        if (!letter && !definition.endsWith('such as')) {
            such_as = false
        } else if (definition.endsWith('such as')) {
            such_as = true
        }
        const tags = []
        if (with_tags) {
            def_record.tags.map((tag, tag_idx) => {
                tags.push(<span key={tag_idx} className="badge rounded-pill text-bg-secondary ms-1">{tag}</span>)
            })
        }
        if (def_record.linked_word) {
            let linked_word = def_record.linked_word;
            let linked_group = def_record.linked_group
            let idx = definition.indexOf(linked_group)
            const part_1 = definition.substring(0, idx)
            const part_3 = definition.substring(idx + linked_group.length)
            result.push(
                <li key={def_idx} className={letter ? such_as && letter ? 'has_letter list-unstyled' : 'has_letter' : ''}>
                    {letter && such_as ? <strong>{letter})</strong> : ''}{part_1}<a target="_blank" href={linked_word}>{linked_group}</a>{part_3}
                    {with_tags ? tags : null}
                </li>
            )
        } else {
            result.push(
                <li key={def_idx} className={letter ? such_as && letter ? 'has_letter list-unstyled' : 'has_letter' : ''}>
                    {letter && such_as? <strong>{letter})</strong> : ''} { definition }
                    {with_tags ? tags : null}
                </li>
            )
        }
    })
    return result
}