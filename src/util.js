export function copyObject(src, template) {
    let dst = src;

    // if( src.constructor === Date   || src.constructor === RegExp || src.constructor === Function ||
    //     src.constructor === String || src.constructor === Number || src.constructor === Boolean )
    //     return new src.constructor(src);
    
    if( src === undefined || src === null ) {
    }
    else if( src.constructor === Object ) {
        dst = new src.constructor();

        if( template === undefined ) {
            for( let n in src )
                //if( src.hasOwnProperty(n) )
                dst[n] = copyObject(src[n]);
        }
        else {
            for( let n in template ) {
                let v = src[n];
                dst[n] = copyObject(v !== undefined ? v : template[n]);
            }
        }
    }
    else if( src.constructor === Array ) {
        dst = new src.constructor();

        for( let v of src )
            dst.push(copyObject(v));
    }
    else
        dst = new src.constructor(src);
    
    return dst;
}

// last argument is template, all rest them objects merge
export function mergeObjectsProps() {
    const argc = arguments.length - 1;
    const template = argc === -1 ? undefined : arguments[argc];
    let dst = {};

    for( let i = 0; i <= argc; i++ ) {
        const src = arguments[i];
        
        if( src === undefined || src === null || src.constructor !== Object )
            continue;

        for( let n in template ) {
            let v = src[n];
            if( dst[n] === undefined && v !== undefined )
                dst[n] = v;
        }
    }

    return dst;
}

// last argument is template, all rest them objects join
export function joinObjectsProps() {
    const argc = arguments.length - 1;
    const template = argc === -1 ? undefined : arguments[argc];
    let dst = {};

    for( let i = 0; i <= argc; i++ ) {
        const src = arguments[i];
        
        if( src.constructor === Object ) {
            for( let n in template )
                if( src[n] !== undefined )
                    dst[n] = src[n];
        }
        else if( src.constructor === Array ) {
            for( let qrc in src )
                for( let n in template )
                    if( qrc[n] !== undefined )
                        dst[n] = qrc[n];
        }
    }

    return dst;
}
