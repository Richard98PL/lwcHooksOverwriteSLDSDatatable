import { LightningElement, track, api } from 'lwc';
import getLeadsAndContacts from '@salesforce/apex/LeadInterestController.getLeadsAndContacts';
import {NavigationMixin} from "lightning/navigation";

export default class LeadInterest extends NavigationMixin(LightningElement) {
    _recordId;
    get recordId(){return this._recordId;}
    @api set recordId(value) {
        this._recordId = value;
        console.log(value);
        getLeadsAndContacts({recordId: value})
            .then(result => {
                console.log("result");
                console.log(result);
                this.recordsList = result.map(item => ({...item,
                            testIcon: item.objectName == 'Lead' ? 'standard:lead' : 'standard:contact',
                            companyUrl: item.objectName == 'Contact' ?  `/${item.companyId}` : item.company,
                            nameUrl: `/${item.id}`,
                            variant : item.objectName == 'Contact' ? 'brand' : 'base'
                        }
                    ));
                console.log(JSON.parse(JSON.stringify(this.recordsList)));
            })
            .catch(error => {
                console.log("error");
                console.log(error);
            });
    };

    @track error;
    @track recordsList;
    @track sortBy;
    @track sortDirection = 'asc';

    @track columns = [
        { label: 'Type',
            fieldName: 'objectName',
            sortable: true,
            cellAttributes:{
                iconName: { fieldName: 'testIcon'},
                iconLabel: { fieldName: 'testAlternative'}
            }
        },
        { label: 'Record type', fieldName: 'recordType', sortable: true},
        { label: 'Created date', fieldName: 'createdDate', sortable: true},
        { label: 'Name',
            fieldName: 'nameUrl',
            type: 'url',
            sortable: true,
            cellAttributes: { alignment: 'left'},
            typeAttributes: {
                label: { fieldName: 'name' },
                variant: 'base'
            },
            wrapText: true
        },
        { label: 'Company',
            fieldName: 'company',
            type: 'button',
            sortable: true,
            cellAttributes: { alignment: 'left'},
            typeAttributes: {
                tooltip: {fieldName: 'company'},
                label: {fieldName: 'company'},
                variant: { fieldName: 'variant' },
            },
            wrapText: true
        },
        { label: 'Phone', fieldName: 'phone', type: 'phone', sortable: true },
        { label: 'Mobile', fieldName: 'mobilePhone', type: 'phone', sortable: true },
        { label: 'Pardot Score', fieldName: 'categories' , type: 'richText', wrapText: true}
    ];

    handleRowAction(event){
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if(row.companyId){
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.companyId,
                    objectApiName: 'Account',
                    actionName: 'view'
                },
            });
        }
    }
    onHandleSort(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(event.detail.fieldName, event.detail.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.recordsList));
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === 'asc' ? 1: -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        this.recordsList = parseData;
    }
}