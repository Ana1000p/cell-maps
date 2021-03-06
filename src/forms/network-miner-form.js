/*
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of Cell Browser.
 *
 * Cell Browser is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * Cell Browser is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Cell Browser. If not, see <http://www.gnu.org/licenses/>.
 */

NetworkMinerForm.prototype = new GenericFormPanel();

function NetworkMinerForm(args) {
    args.analysis = 'network-miner.default';
    args.title = 'Network set enrichment analysis - Network Miner';
    args.border = false;
    args.buttonConfig = {
        width: 100,
        height: undefined
    };
    GenericFormPanel.prototype.constructor.call(this, args);

    this.id = Utils.genId("NetworkMinerForm");
    this.headerWidget = this.webapp.headerWidget;
    this.opencgaBrowserWidget = this.webapp.headerWidget.opencgaBrowserWidget;

}

NetworkMinerForm.prototype.beforeRun = function () {

    if (this.testing) {
        console.log("Watch out!!! testing flag is on, so job will not launched.")
    }
    this.paramsWS['o-name'] = 'result';
    this.paramsWS['components'] = 'true';
    this.paramsWS['randoms'] = '1000';

    if (this.paramsWS['inputSource'] === 'text') {
        this.paramsWS['list'] = 'list-text'
    } else {
        delete this.paramsWS['list-text'];
    }

    if (this.paramsWS['seedInputSource'] === 'text') {
        if (this.paramsWS['seedlist-text'] !== '') {
            this.paramsWS['seedlist'] = 'seedlist-text';
        } else {
            delete this.paramsWS['seedlist-text'];
            delete this.paramsWS['seedlist'];
        }
    } else {
        delete this.paramsWS['seedlist-text'];
    }

    delete this.paramsWS['inputSource'];
    delete this.paramsWS['seedInputSource'];
};


NetworkMinerForm.prototype.getPanels = function () {
    return [
        this._getExampleForm(),
        this._getForm()
    ];
};


NetworkMinerForm.prototype._getExampleForm = function () {
    var _this = this;

    var example1 = Ext.create('Ext.container.Container', {
        layout: 'hbox',
        items: [
            {
                xtype: 'button',
                width: this.labelWidth,
                text: 'Load example 1',
                handler: function () {
                    _this.loadExample();
                    Utils.msg("Example 1", "Loaded");
                }
            },
            {
                xtype: 'box',
                margin: '5 0 0 15',
                html: 'Gene list'

            }
        ]
    });

    var exampleForm = Ext.create('Ext.panel.Panel', {
        bodyPadding: 10,
        title: 'Examples',
        header: this.headerFormConfig,
        border: this.formBorder,
        items: [example1],
        defaults: {margin: '5 0 0 0'},
        margin: '0 0 10 0'
    });

    return exampleForm;
};

NetworkMinerForm.prototype._getForm = function () {
    var _this = this;


    this.inputArea = Ext.create('Ext.form.field.TextArea', {
        fieldLabel: 'Text ranked list',
        labelWidth: this.labelWidth,
        flex: 1,
        enableKeyEvents: true,
        value: '',
        name: 'list-text',
        allowBlank: false,
        listeners: {
            change: function (me) {
                me.getValue()
            }
        }
    });

    this.opencgaBrowserCmp = this.createOpencgaBrowserCmp({
        fieldLabel: 'Ranked  list',
        dataParamName: 'list',
        id: this.id + 'list',
        mode: 'fileSelection',
        allowedTypes: ['txt'],
        allowBlank: false
    });

    this.radioInputType = Ext.create('Ext.form.RadioGroup', {
        fieldLabel: 'Select your ranked list from',
        labelWidth: this.labelWidth,
        defaults: {
            margin: '0 0 0 10',
            name: 'inputSource'
        },
        items: [
            {
                boxLabel: 'Text area',
                checked: true,
                inputValue: 'text'
            },
            {
                boxLabel: 'File from server',
                inputValue: 'file'
            }
        ],
        listeners: {
            change: function (radiogroup, newValue, oldValue, eOpts) {
                var value = radiogroup.getValue();
                if (value['inputSource'] === 'text') {
                    formBrowser.remove(_this.opencgaBrowserCmp, false);
                    formBrowser.insert(1, _this.inputArea);
                } else {
                    formBrowser.remove(_this.inputArea, false);
                    formBrowser.insert(1, _this.opencgaBrowserCmp);
                }
            }
        }
    });


    this.listNatureCombo = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Lists nature',
        labelWidth: this.labelWidth,
        labelAlign: 'left',
        name: 'list-tags',
        store: Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data: [
                {name: 'Genes', value: 'gene,idlist'},
                {name: 'Ranked', value: 'ranked,idlist'},
                {name: 'Proteins', value: 'protein,idlist'},
                {name: 'Transcripts', value: 'transcript,idlist'}
            ]
        }),
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'value',
        queryMode: 'local',
        forceSelection: true,
        value: 'gene,idlist',
        listeners: {
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    //?
                }
            }
        }
    });


    this.seedInputArea = Ext.create('Ext.form.field.TextArea', {
        fieldLabel: 'Text seed list',
        labelWidth: this.labelWidth,
        flex: 1,
        enableKeyEvents: true,
        value: '',
        name: 'seedlist-text',
        allowBlank: true,
        listeners: {
            change: function (me) {
                me.getValue()
            }
        }
    });

    this.seedOpencgaBrowserCmp = this.createOpencgaBrowserCmp({
        fieldLabel: 'Seed list',
        dataParamName: 'seedlist',
        id: this.id + 'seedlist',
        mode: 'fileSelection',
        allowedTypes: ['txt'],
        allowBlank: false
    });

    this.seedRadioInputType = Ext.create('Ext.form.RadioGroup', {
        fieldLabel: 'Select your seed list from',
        labelWidth: this.labelWidth,
        defaults: {
            margin: '0 0 0 10',
            name: 'seedInputSource'
        },
        items: [
            {
                boxLabel: 'Text area',
                checked: true,
                inputValue: 'text'
            },
            {
                boxLabel: 'File from server',
                inputValue: 'file'
            }
        ],
        listeners: {
            change: function (radiogroup, newValue, oldValue, eOpts) {
                var value = radiogroup.getValue();
                if (value['seedInputSource'] === 'text') {
                    formBrowser.remove(_this.seedOpencgaBrowserCmp, false);
                    formBrowser.insert(3, _this.seedInputArea);
                } else {
                    formBrowser.remove(_this.seedInputArea, false);
                    formBrowser.insert(3, _this.seedOpencgaBrowserCmp);
                }
            }
        }
    });


    this.speciesStore = Ext.create('Ext.data.Store', {
        fields: [ 'name', 'value' ],
        data: [
            {name: "Homo sapiens", value: "hsa"},
//            {name: "Mus musculus", value: "mmusculus"},
//            {name: "Rattus norvegicus", value: "rnorvegicus"},
//            {name: "Bos taurus", value: "btaurus"},
//            {name: "Gallus gallus", value: "ggallus"},
//            {name: "Sus scrofa", value: "sscrofa"},
//            {name: "Canis familiaris", value: "cfamiliaris"},
//            {name: "Drosophila melanogaster", value: "dmelanogaster"},
//            {name: "Caenorhabditis elegans", value: "celegans"},
//            {name: "Saccharomyces cerevisiae", value: "scerevisiae"},
//            {name: "Danio rerio", value: "drerio"},
//            {name: "Schizosaccharomyces pombe", value: "spombe"},
//            {name: "Escherichia coli", value: "ecoli"},
//            {name: "Human immunodeficiency virus 1", value: "hiv-1"},
//            {name: "Influenza A virus", value: "flu-a"},
//            {name: "Clostridium botulinum", value: "cbotulinum"},
//            {name: "Arabidopsis thaliana", value: "athaliana"},
//            {name: "Plasmodium falciparum", value: "pfalciparum"},
//            {name: "Dictyostelium discoideum", value: "ddiscoideum"},
//            {name: "Mycobacterium tuberculosis", value: "mtuberculosis"},
//            {name: "Neisseria meningitidis serogroup B", value: "nmeningitidis"},
//            {name: "Chlamydia trachomatis", value: "ctrachomatis"},
//            {name: "Oryza sativa", value: "osativa"},
//            {name: "Toxoplasma gondii", value: "tgondii"},
//            {name: "Xenopus tropicalis", value: "xtropicalis"},
//            {name: "Salmonella typhimurium", value: "styphimurium"},
//            {name: "Taeniopygia guttata", value: "tguttata"},
//            {name: "Staphylococcus aureus N315", value: "saureus"}
        ]
    });

    this.speciesCombo = Ext.create('Ext.form.field.ComboBox', {
        labelAlign: 'left',
        labelWidth: this.labelWidth,
        name: 'interactome',
        fieldLabel: 'Species',
        store: _this.speciesStore,
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'value',
        queryMode: 'local',
        forceSelection: true,
        value: 'hsa',
        listeners: {
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    //?
                }
            }
        }
    });


    this.interactomeReferenceCombo = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Select interactome confidence',
        labelWidth: this.labelWidth,
        labelAlign: 'left',
        name: 'group',
        store: Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data: [
                {name: 'Non curated', value: 'all'},
                {name: 'Curated (detected by at least two methods)', value: 'curated'}
            ]
        }),
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'value',
        queryMode: 'local',
        forceSelection: true,
        value: 'all',
        listeners: {
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    //?
                }
            }
        }
    });


    this.orderCombo = Ext.create('Ext.form.field.ComboBox', {
        fieldLabel: 'Sort ranked list',
        labelWidth: this.labelWidth,
        labelAlign: 'left',
        name: 'order',
        store: Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data: [
                {name: 'Ascending', value: 'ascending'},
                {name: 'Descending', value: 'descending'}
            ]
        }),
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'value',
        queryMode: 'local',
        forceSelection: true,
        value: 'ascending',
        listeners: {
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    //?
                }
            }
        }
    });


    this.externalIntermediateCombo = Ext.create('Ext.form.field.ComboBox', {
        labelAlign: 'left',
        labelWidth: this.labelWidth,
        name: 'intermediate',
        fieldLabel: 'Allow one external intermediate in the subnetwork',
        store: Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data: [
                {name: 'Yes', value: '1'},
                {name: 'No', value: '0'}
            ]
        }),
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'value',
        queryMode: 'local',
        forceSelection: true,
        value: '1',
        listeners: {
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    //?
                }
            }
        }
    });


    this.significanceNumberField = Ext.create('Ext.form.field.Number', {
        labelWidth: this.labelWidth,
        name: 'significant-value',
        fieldLabel: 'Select threshold of significance (p-value)',
        value: 0.05,
        maxValue: 1,
        minValue: 0,
        step: 0.01,
        listeners: {
            change: {
                buffer: 100,
                fn: function (field, newValue) {
                    if (newValue != null) {

                    }
                }
            }
        }
    });


    var formBrowser = Ext.create('Ext.panel.Panel', {
        title: "Input parameters",
        header: this.headerFormConfig,
        border: this.border,
//        padding: "5 0 0 0",
        bodyPadding: 10,
        defaults: {
            margin: '10 0'
        },
        items: [
//            note1,
            this.radioInputType,
            this.inputArea,
            this.seedRadioInputType,
            this.seedInputArea,
            this.listNatureCombo,
            this.speciesCombo,
            this.interactomeReferenceCombo,
            this.orderCombo,
            this.externalIntermediateCombo,
            this.significanceNumberField
        ]
    });
    return formBrowser;
};


NetworkMinerForm.prototype.loadExample = function () {
    this.clean();

    this.radioInputType.setValue({inputSource: 'file'});
    this.seedRadioInputType.setValue({seedInputSource: 'file'});

    Ext.getCmp(this.id + 'seedlist').setValue('BD-associatedgenesUniprot.txt');
    Ext.getCmp(this.id + 'seedlist' + 'hidden').setValue('example_BD-associatedgenesUniprot.txt');

    Ext.getCmp(this.id + 'list').setValue('BD-GWASplink.txt');
    Ext.getCmp(this.id + 'list' + 'hidden').setValue('example_BD-GWASplink.txt');

    Ext.getCmp(this.id + 'jobname').setValue("Example");
    Ext.getCmp(this.id + 'jobdescription').setValue("Example");
};