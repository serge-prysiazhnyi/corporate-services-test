import { person, officers, shareholdingDetail, shareholdingSummary } from './data';

class CorporateServices {

    constructor(person, officers, shareholdingDetail, shareholdingSummary) {
        this.data = {
            person,
            officers,
            shareholdingDetail,
            shareholdingSummary
        }
    }

    getPersonWidoId(person) {
        let personNames = person.split(' ');
        let FirstName = personNames[0];
        let LastName = personNames[personNames.length - 1];
        let widoId = null;
        this.data.person.forEach(item => {
            if(item.FirstName === FirstName || item.LastName === LastName) {
                widoId = item.widoId;
            }
        })
        return widoId;
    }

    generateShareholdingCertificateNumber() {
        let newNumber = parseInt(this.data.shareholdingDetail[this.data.shareholdingDetail.length - 1].CertificateNumber) + 1;
        return newNumber.toString();
    }

    getTodayDate() {
        let date = new Date();
        let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        let year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    generateWidoId(data) {
        let newWidoId = 0;
        data.forEach(item => {
            if(newWidoId < parseInt(item.widoId)) newWidoId = parseInt(item.widoId) + 1;
        });

        return newWidoId.toString();
    }

    createsShareholdingCertificate(buyer, ShareClass, ShareCurrency, ShareQty) {
        this.data.shareholdingDetail.push({
            Person: this.getPersonWidoId(buyer),
            CertificateNumber: this.generateShareholdingCertificateNumber(),
            AcquisitionDate: this.getTodayDate(),
            ShareClass,
            ShareCurrency,
            ShareQty,
            widoId: this.generateWidoId(this.data.shareholdingDetail)
        });
    }

    updateOfficersList (person, role) {
        const checkPersonRole = () => {
            return this.data.officers.findIndex(item => {
                return item.Person === this.getPersonWidoId(person) && item.Role === role;
            }) === -1 ? false : true;
        }

        if(!checkPersonRole()) {
            this.data.officers.push({
                Person: this.getPersonWidoId(person),
                Role: role,
                StartDate: this.getTodayDate(),
                widoId: this.generateWidoId(this.data.officers)
            })
        }

    }

    updateShareholdingSummary(person, ShareClass, ShareCurrency, ShareQty, action) {

        const checkPersonExistence = () => {
            return this.data.shareholdingSummary.findIndex(item => {
                return item.Person === this.getPersonWidoId(person);
            }) === -1 ? false : true;
        }

        const checkZeroBalance = () => {
            let currentShareQty = this.data.shareholdingSummary.filter(item => {
                return item.Person === this.getPersonWidoId(person)
            })[0].ShareQty
            return parseInt(currentShareQty) - parseInt(ShareQty) <= 0 ? true : false;
        }

        if(action === 'add') {
            if(!checkPersonExistence()) {
                this.data.shareholdingSummary.push({
                    Person: this.getPersonWidoId(person),
                    ShareClass,
                    ShareCurrency,
                    ShareQty
                });
            }   else {
                this.data.shareholdingSummary.forEach(item => {
                    // already exist
                    if(item.widoId === this.getPersonWidoId(person) && item.shareholdingDetail === shareholdingDetail && item.ShareCurrency === ShareCurrency) {
                        let newShareQty = parseInt(item.ShareQty) + parseInt(ShareQty)
                        item.ShareQty = newShareQty.toString();
                    }   else {
                        // add new item
                        this.data.shareholdingSummary.push({
                            Person: this.getPersonWidoId(person),
                            ShareClass,
                            ShareCurrency,
                            ShareQty
                        });
                    }
                })
            }

        }   else if (action === 'subtract') {
            // remove item
            if(checkZeroBalance()) {
                this.data.shareholdingSummary = this.data.shareholdingSummary.map(item => {
                    item.Person != this.getPersonWidoId(person)
                });
                // update ShareQty
            }   else {
                this.data.shareholdingSummary.forEach(item => {
                    if(item.Person === this.getPersonWidoId(person)) {
                        let newShareQty = parseInt(item.ShareQty) - parseInt(ShareQty);
                        item.ShareQty = newShareQty.toString();
                    }
                });
            }
        }
    }

    buyShares(buyer, seller, ShareClass, ShareCurrency, ShareQty) {

        const checkSellerBalance = () => {
            return this.data.shareholdingSummary.findIndex(item => {
                console.log("CorporateServices -> checkSellerBalance -> parseInt(item.ShareQty) > parseInt(ShareQty)", parseInt(item.ShareQty) > parseInt(ShareQty))
                return item.Person === this.getPersonWidoId(seller) && parseInt(item.ShareQty) > parseInt(ShareQty)
            }) === -1 ? false : true;
        }

        if(!checkSellerBalance()) {
            console.log('the seller does not have enough shares');
            return; 
        }

        // create new certificate
        this.createsShareholdingCertificate(buyer, ShareClass, ShareCurrency, ShareQty);

        // update officers list
        this.updateOfficersList(buyer, "Shareholder");

        // update summary for buyer
        this.updateShareholdingSummary(buyer, ShareClass, ShareCurrency, ShareQty, 'add');

        // update summary for seller
        this.updateShareholdingSummary(seller, ShareClass, ShareCurrency, ShareQty, 'subtract');
    }
}

let corporateServices = new CorporateServices(person, officers, shareholdingDetail, shareholdingSummary);
corporateServices.buyShares('Richard Jameson', 'Emma Semuels', 'Ordinary ', 'Euro', "50")
console.log("corporateServices", corporateServices.data)
