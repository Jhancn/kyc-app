module.exports = {
    // aadhaar card
    aadhaarCard_ind: (text, textBack) => {
        // back view
        if(textBack) {
            // ### address::starts ###
            const addressRegex = /Address\s+(.*?)(?=\s+\d{4}\s+\d{4}\s+\d{4}|$)/;
            const addressMatch = text.match(addressRegex);
            let address = addressMatch && addressMatch[1] ? (addressMatch[1]).trim() : ''
            // format address (remove duplicate address)
            if(address) {
                address = address.replace(/\s{2,}/g, ' ')

                // regex to remove duplicate address
                const textRegex = /(.*?\d{6})/

                // get final address
                const finalAddressMatch = address.match(textRegex)
                // assign to address
                address = finalAddressMatch && finalAddressMatch[0] ? (finalAddressMatch[0]).trim() : ''
            }
            // ### address::ends ###
            
            // ### documentNo::starts ###
            const documentNoRegex = /\d{4}\s+\d{4}\s+\d{4}$/;
            const documentNoMatch = text.match(documentNoRegex);
            let documentNo = documentNoMatch && documentNoMatch[0] ? (documentNoMatch[0]).trim() : ''
            // ### documentNo::ends ###

            return {
                address: address || '',
                documentNo: documentNo || '',
            };
        }
    },

    // pan card
    panCard_ind: (text) => {
        const words = text.split(' ');

        // get correct name from acutal name
        function getFormattedName(name) {
            // Regular expression to match the name (up to the first lowercase letter)
            const nameRegex = /([A-Z\s-]+)/;
            const nameMatch = name.match(nameRegex);
            const fromattedName = nameMatch && nameMatch[1] ? (nameMatch[1]).trim() : '';
            return fromattedName
        }

        // get field from unique text
        function getFieldFromUniqueText(uniqueText) {
            const startIndex = text.indexOf(uniqueText);
            let field = ''
            if(startIndex !== -1) {
                const afterSubstring = text.substring(startIndex + uniqueText.length);
                // Extract capital case letters using regular expression
                const capitalLetters = afterSubstring.match(/[A-Z][A-Z ]+/);
                field = capitalLetters && capitalLetters[0] ? (capitalLetters[0]).trim() : ''
            }
            return field
        }

        // ### documentNo::starts ###
        const documentNoRegex = /\b[A-Za-z0-9]+\b/;
        let documentNo = ''
        for (const word of words) {
            if (documentNoRegex.test(word)) {
                if (/[A-Z]/.test(word) && /[0-9]/.test(word)) {
                    documentNo = word.trim();
                    break;
                }
            }
        }
        // replace document number with unique text(that can be found)
        if(documentNo) {
            text = text.replace(documentNo, 'ss_documentNo_ss')
        }
        // ### documentNo::ends ###
        
        // ### name::starts ###
        const nameRegex = /Name (.*?) (Father's Name|Fathers Name)/;
        const nameMatch = text.match(nameRegex);
        let name = nameMatch && nameMatch[1] ? (nameMatch[1]).trim() : '';
        // if name ditn't found
        // use documentNo(replaced unique text) to get name
        if(!name) {
            name = getFieldFromUniqueText('ss_documentNo_ss')
        }
        // replace name with unique text
        if(name) {
            text = text.replace(name, 'ss_name_ss')
        }
        // ### name::ends ###
        
        // ### fatherName::starts ###
        const fatherNameRegex = /(?:Father's Name|Fathers Name) (.*?) Date of Birth/;
        const fatherNameMatch = text.match(fatherNameRegex);
        let fatherName = fatherNameMatch && fatherNameMatch[1] ? (fatherNameMatch[1]).trim() : '';
        if(!fatherName) {
            const fatherNameRegex = /(fathers|Fathers)\s((?:[A-Z][a-z]*\s*)+)/;
            const fatherNameMatch = text.match(fatherNameRegex)
            fatherName = fatherNameMatch && fatherNameMatch[0] ? (fatherNameMatch[0]).trim() : ''
            if(fatherName) {
                fatherName = (fatherName.match(/\b[A-Z]+\b/g)).join(' ')
            }
        }
        // if fatherName ditn't found
        // get fatherName using name(unique text)
        if(!fatherName) {
            fatherName = getFieldFromUniqueText('ss_name_ss')
        }
        // ### fatherName::ends ###

        // ### dob::starts ###
        const dateRegex = /\d{2}\/\d{2}\/\d{4}/g;
        const dateMatch = text.match(dateRegex);
        let dob = dateMatch && dateMatch[0] ? (dateMatch[0]).trim() : '';
        // ### dob::ends ###

        // format name & fatherName
        if(name) {
            name = getFormattedName(name)
        }
        if(fatherName) {
            fatherName = getFormattedName(fatherName)
        }

        return {
            documentNo: documentNo || '',
            name: name || '',
            fatherName: fatherName || '',
            dob: dob || ''
        }
    },

    // driving license
    drivingLicense_ind: (text) => {
        const words = text.split(' ');

        text = text.replace(/s\/o/g, 'S/O')
        text = text.replace(/w\/o/g, 'W/O')
        text = text.replace(/d\/o/g, 'D/O')

        // ### documentNo::starts ###
        const documentNoRegex = /\b[A-Za-z0-9]{15}\b/;
        const documentNoMatch = text.match(documentNoRegex);
        let documentNo = documentNoMatch && documentNoMatch[0] ? (documentNoMatch[0]).trim() : '';
        if(!documentNo) {
            const documentNoRegex = /\b[A-Za-z0-9]+\b/;
            for (const word of words) {
                if (documentNoRegex.test(word)) {
                    if (/[A-Z]/.test(word) && /[0-9]/.test(word)) {
                        documentNo = word.trim();
                        break;
                    }
                }
            }
        }
        // replace document number with unique text(that can be found)
        if(documentNo) {
            const regex = new RegExp(documentNo, 'g')
            text = text.replace(regex, 'ss_documentNo_ss')
        }
        // ### documentNo::ends ###

        // ### name::starts ###
        let name = ''
        const startIndex = text.indexOf('ss_documentNo_ss')
        if(startIndex !== -1) {
            const nameRegex = /ss_documentNo_ss\s([^\s]+(?:\s[^\s]+)?)(?=\s(?:S\/O|D\/O|W\/O))/;
            const nameMatch = text.match(nameRegex);
            name = nameMatch && nameMatch[1] ? nameMatch[1].trim() : '';
        }
        if(!name) {
            const nameRegex = /\b[A-Za-z0-9]+\s([^\s]+(?:\s[^\s]+)?)(?=\s(?:S\/O|D\/O|W\/O))/;
            const nameMatch = text.match(nameRegex);
            name = nameMatch && nameMatch[1] ? (nameMatch[1]).trim() : '';
        }
        // replace 'name' with unique text
        if(name) {
            const regex = new RegExp(name, 'g')
            text = text.replace(regex, 'ss_name_ss')
        }
        // ### name::ends ###
        
        // ### address::starts ###
        const addressRegex = /\b(?:S\/O|D\/O|W\/O)\s(.+?\b\d{6}\b)/;
        const addressMatch = text.match(addressRegex);
        let address = addressMatch && addressMatch[0] ? (addressMatch[0]).trim() : '';
        if(!address) {
            const addressRegex = /\b(?:S\/O|D\/O|W\/O)\s(.+?\b\d{5}[0-9a-zA-Z]?\b)/;
            const addressMatch = text.match(addressRegex)
            address = addressMatch && addressMatch[0] ? (addressMatch[0]).trim() : ''
        }
        // if address didn't found
        // use name(unique text)
        if(!address) {
            const startIndex = text.indexOf('ss_name_ss')
            if(startIndex !== -1) {
                const addressRegex = /ss_name_ss\s(.+?\b\d{6}\b)/;
                const addressMatch = text.match(addressRegex)
                address = addressMatch && addressMatch[1] ? (addressMatch[1]).trim() : ''
            }
        }
        // ### address::ends ###

        return {
            documentNo: documentNo || '',
            name: name || '',
            address: address || ''
        }
    },

    // driving license
    drivingLicense_phl: (text) => {
        // replace string(driver's license) with unique text
        text = text.replace("DRIVERS LICENSE", 'ss_drivers_license')

        // ### lastName::starts ###
        const lastNameRegex = /([A-Z ]+),/; // first word with capital letters followed by a comma
        const lastNameMatch = text.match(lastNameRegex);
        let lastName = lastNameMatch && lastNameMatch[1] ? (lastNameMatch[1]).trim() : '';
        // if lastName ditn't found
        // get lastName using unique text
        if(!lastName) {
            const startIndex = text.indexOf('ss_drivers_license');
            if(startIndex !== -1) {
                const afterSubstring = text.substring(startIndex + 'ss_drivers_license'.length);
                // Extract capital case letters using regular expression
                const capitalLetters = afterSubstring.match(/[A-Z][A-Z]+/);
                lastName = capitalLetters && capitalLetters[0] ? (capitalLetters[0]).trim() : ''
            }
        }
        // replace lastName with unique text
        if(lastName) {
            text = text.replace(lastName, 'ss_lastName_ss')
        }
        // ### lastName::ends ###
        
        // ### firstName & middleName::starts ###
        const remainingNameRegex = /[A-Z, ]+, ([A-Z][A-Z ]*[A-Z]+)/; // name following the last name
        const remainingNameMatch = text.match(remainingNameRegex);
        let remainingName = remainingNameMatch && remainingNameMatch[1] ? (remainingNameMatch[1]).trim() : '';
        // if remainingName not found
        // get remainingName using lastName(unique text)
        if(!remainingName) {
            const startIndex = text.indexOf('ss_lastName_ss');
            if(startIndex !== -1) {
                const afterSubstring = text.substring(startIndex + 'ss_lastName_ss'.length);
                // Extract capital case letters using regular expression
                const capitalLetters = afterSubstring.match(/[A-Z][A-Z ]+/);
                remainingName = capitalLetters && capitalLetters[0] ? (capitalLetters[0]).trim() : ''
            }
        }
        let firstName = ''; // first name
        let middleName = ''; // middle name
        // replace remainingName with unique text & get firstName and middleName
        if(remainingName) {
            // unique text
            text = text.replace(remainingName, 'ss_remainingName_ss')

            // firstName & middleName
            const nameParts = remainingName.split(' ');
            if(nameParts && nameParts.length) {
                firstName = (nameParts[0]).length > 1 ? nameParts[0] : '';
                middleName = (nameParts.slice(1).join(' ')).length > 1 ? nameParts.slice(1).join(' ') : '';
            }
        }
        // ### firstName & middleName::ends ###
        
        // ### dob & expireDate::starts ###
        const dateRegex = /\d{4}\/\d{2}\/\d{2}/g;
        const dateMatch = text.match(dateRegex);
        let dob = dateMatch && dateMatch[0] ? (dateMatch[0]).trim() : '';
        // replace dob with unique text
        if(dob) {
            text = text.replace(dob, 'ss_dob_ss')
        }
        let expireDate = dateMatch && dateMatch[1] ? (dateMatch[1]).trim() : '';
        // replace expireDate with unique text
        if(expireDate) {
            text = text.replace(expireDate, 'ss_expireDate_ss')
        }
        // ### dob & expireDate::ends ###
        
        // ### address::starts ###
        const addressRegex = /Address\s([0-9A-Z ]+)(?=[A-Z])/;
        const addressMatch = text.match(addressRegex);
        let address = addressMatch && addressMatch[1] ? (addressMatch[1]).trim() : '';
        // if address not found
        // get address using dob(unique text)
        if(!address) {
            const startIndex = text.indexOf('ss_dob_ss');
            if(startIndex !== -1) {
                const afterSubstring = text.substring(startIndex + 'ss_dob_ss'.length);
                // Extract capital case letters using regular expression
                const capitalLetters = afterSubstring.match(/[A-Z][A-Z ]+/);
                address = capitalLetters && capitalLetters[0] ? (capitalLetters[0]).trim() : ''
            }
        }
        // ### address::ends ###
        
        // ### documentNo::starts ###
        const documentNoRegex = /(\d{3}-\d{2}-\d{3})\s(\d{3})/;
        const documentNoMatch = text.match(documentNoRegex);
        let documentNo = documentNoMatch && documentNoMatch[0] ? (documentNoMatch[0]).trim() : '';
        // replace documentNo with unique text
        if(documentNo) {
            text = text.replace(documentNo, 'ss_documentNo_ss')
        }
        // ### documentNo::ends ###

        // ### agencyCode::starts ###
        const agencyCodeRegex = /(\d{4}\/\d{2}\/\d{2}\s)([A-Z0-9]{3})/; // 3 capital letters or alpha-numeric characters after the second date
        const agencyCodeMatch = text.match(agencyCodeRegex);
        let agencyCode = agencyCodeMatch && agencyCodeMatch[2] ? (agencyCodeMatch[2]).trim() : '';
        if(!agencyCode) {
            const agencyCodeRegex = /(Agency Code\s)([A-Z0-9]{3})/; // 3 capital letters or alpha-numeric characters after the word 'Agency Code'
            const agencyCodeMatch = text.match(agencyCodeRegex);
            agencyCode = agencyCodeMatch && agencyCodeMatch[2] ? (agencyCodeMatch[2]).trim() : '';
        }
        // if agencyCode ditn't found
        // get agencyCode using expireDate(unique text)
        if(!agencyCode) {
            const startIndex = text.indexOf('ss_expireDate_ss');
            if(startIndex !== -1) {
                const afterSubstring = text.substring(startIndex + 'ss_expireDate_ss'.length);
                // Extract capital case letters using regular expression
                const capitalLetters = afterSubstring.match(/[A-Z]+/);
                agencyCode = capitalLetters && capitalLetters.length && ((capitalLetters[0]).trim()).length === 3 ? (capitalLetters[0]).trim() : ''
            }
        }
        // ### agencyCode::ends ###
        
        return {
            documentNo: documentNo || '',
            dob: dob || '',
            expireDate: expireDate || '',
            address: address || '',
            lastName: lastName || '',
            firstName: firstName || '',
            middleName: middleName || '',
            agencyCode: agencyCode || '',
        }
    },

    // unified multi-purpose id
    unifiedMultiPurposeId_phl: (text) => {
        // replace 'CRN', 'CRN-', 'CRN -', 'CRN - ' with 'CRN '
        text = text.replace(/CRN/g, 'CRN ')
        text = text.replace(/CRN-/g, 'CRN ')
        text = text.replace(/CRN -/g, 'CRN ')
        text = text.replace(/CRN - /g, 'CRN ')
        text = text.replace(/CRN  - /g, 'CRN ')
        // replace 'BIVEN' with 'GIVEN'
        text = text.replace(/BIVEN/g, 'GIVEN')
        // replace 'GIVEN JAME' with 'GIVEN NAME'
        text = text.replace(/GIVEN JAME/g, 'GIVEN NAME')

        // ### documentNo::starts ###
        const documentNoRegex = /CRN\s (\d{4}-\d{7}-\d)/g // regex using pattern
        const documentNoMatch = text.match(documentNoRegex);
        let documentNo = documentNoMatch && documentNoMatch[1] ? (documentNoMatch[1]).trim() : ''
        if(!documentNo) {
            const documentNoRegex = /CRN\s+([\w-]+)/; // regex using next word of "CRN"
            const documentNoMatch = text.match(documentNoRegex);
            documentNo = documentNoMatch && documentNoMatch[1] ? (documentNoMatch[1]).trim() : ''
        }
        // replace documentNo with unique text
        if(documentNo) {
            const regex = new RegExp(documentNo, 'g')
            text = text.replace(regex, 'ss_documentNo_ss')
        }
        // ### documentNo::ends ###

        // ### surName::starts ###
        const surNameRegex = /SURNAME\s(.*?)\sGIVEN/; // starts with SURNAME and ends with GIVEN
        const surNameMatch = text.match(surNameRegex);
        let surName = surNameMatch && surNameMatch[1] ? (surNameMatch[1]).trim() : ''
        if(!surName) {
            const surNameRegex = /SURNAME (.*?)(?: \w+EN)/; // starts with SURNAME and ends with the word which ends with EN
            const surNameMatch = text.match(surNameRegex)
            surName = surNameMatch && surNameMatch[1] ? (surNameMatch[1]).trim() : ''
            // console.log('--> surname', surName)
        }
        // replace surName with unique text
        if(surName) {
            const regex = new RegExp(surName, 'g')
            text = text.replace(regex, 'ss_surName_ss')
        }
        // replace 'SURNAME' with unique text
        const regex = new RegExp('SURNAME', 'g')
        text = text.replace(regex, 'ss_surNameField_ss')
        // ### surName::ends ###

        // ### givenName::starts ###
        const givenNameRegex = /GIVEN NAME\s(.*?)\sMIDDLE/; // regex using 'GIVEN NAME' & 'MIDDLE'
        const givenNameMatch = text.match(givenNameRegex);
        let givenName = givenNameMatch && givenNameMatch[1] ? (givenNameMatch[1]).trim() : ''
        if(!givenName) {
            const givenNameRegex = /GIVEN NAME (.*?)(?: \w+LE)/ // starts after the word 'GIVEN NAME'
            const givenNameMatch = text.match(givenNameRegex)
            givenName = givenNameMatch && givenNameMatch[1] ? (givenNameMatch[1]).trim() : ''
        }
        if(!givenName) {
            const givenNameRegex = /(?:\w+ME\s)(.*?)(?:\sMIDDLE)/ // starts with the word which ends with 'ME' and ends before the word 'MIDDLE'
            const givenNameMatch = text.match(givenNameRegex)
            givenName = givenNameMatch && givenNameMatch[1] ? (givenNameMatch[1]).trim() : ''
        }
        if(!givenName) {
            const givenNameRegex = /(?:\w+ME\s)(.*?)(?: \w+LE)/ // starts with the word which ends with 'ME' and ends before the word which ends with 'LE'
            const givenNameMatch = text.match(givenNameRegex)
            givenName = givenNameMatch && givenNameMatch[1] ? (givenNameMatch[1]).trim() : ''
        }
        // replace givenName with unique text
        if(givenName) {
            const regex = new RegExp(givenName, 'g')
            text = text.replace(regex, 'ss_givenName_ss')
        }
        // ### givenName::ends ###

        // ### middleName::starts ###
        const middleNameRegex = /MIDDLE NAME\s(.*?)\sSEX/
        const middleNameMatch = text.match(middleNameRegex)
        let middleName = middleNameMatch && middleNameMatch[1] ? (middleNameMatch[1]).trim() : ''
        // if middleName didn't found
        // get middleName using givenName(unique text)
        if(!middleName) {
            const startIndex = text.indexOf('ss_givenName_ss')
            if(startIndex !== -1) {
                const remainingRegex = /ss_givenName_ss (.*?) SEX/;
                const remainingMatch = text.match(remainingRegex)
                const remaining = remainingMatch && remainingMatch[1] ? (remainingMatch[1]).trim() : ''
                // get the words b/w givenName and sex
                if(remaining) {
                    // get middlename
                    const words = remaining.split(' ')
                    const middleNameWords = words.filter(word => !(word.endsWith('LE')) && !(word.endsWith('ME')))
                    middleName = middleNameWords && middleNameWords.length ? middleNameWords.join(' ') : ''
                }
            }
        }
        if(!middleName) {
            const middleNameRegex = /(?:\w+LE\s)(.*?)(?: \w+X)/ // starts with the word which ends with 'LE' and ends before the word which ends with 'X'
            const middleNameMatch = text.match(middleNameRegex)
            middleName = middleNameMatch && middleNameMatch[1] ? (middleNameMatch[1]).trim() : ''
        }
        // ### middleName::ends ###

        // ### dob::starts ###
        const dateRegex = /\d{4}\/\d{2}\/\d{2}/g
        const dateMatch = text.match(dateRegex)
        let dob = dateMatch && dateMatch[0] ? (dateMatch[0]).trim() : ''
        // ### dob::ends ###

        // ### address::starts ###
        const addressRegex = /.*ADDRESS (.*)/s;
        const addressMatch = addressRegex.exec(text);
        let address = addressMatch && addressMatch[1] ? (addressMatch[1]).trim() : ''
        // ### address::ends ###

        return {
            documentNo: documentNo || '',
            surName: surName || '',
            givenName: givenName || '',
            middleName: middleName || '',
            dob: dob || '',
            address: address || '',
        }
    }
}