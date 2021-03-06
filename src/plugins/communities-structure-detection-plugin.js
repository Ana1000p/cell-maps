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

function CommunitiesStructureDetectionPlugin(args) {
    var _this = this;
    this.id = Utils.genId('CommunitiesStructureDetectionPlugin');


    this.cellMaps = args.cellMaps;
    this.attributeManager = this.cellMaps.networkViewer.network.edgeAttributeManager;
    this.attributeStore = Ext.create('Ext.data.Store', {
        fields: ['name'],
        data: this.attributeManager.attributes
    });
    this.attributeManager.on('change:attributes', function () {
        _this.attributeStore.loadData(_this.attributeManager.attributes);
    });
//    this.cellMaps.networkViewer.on('select:vertices', function () {
//        if (_this.mode === 'selected') {
//            _this.textArea.setValue(_this.getSelectedNetworkVerticesText());
//        }
//    });

    this.attributeNameSelected;
}

CommunitiesStructureDetectionPlugin.prototype.show = function () {
    this.window.show();
};

CommunitiesStructureDetectionPlugin.prototype.draw = function () {
    var _this = this;

    this.methodCombo = Ext.create('Ext.form.field.ComboBox', {
        labelWidth: 200,
        fieldLabel: 'Community detection method',
        id: this.id + "methodCombo",
        store: ['fastgreedy', 'walktrap', 'infomap'],
        queryMode: 'local',
        forceSelection: true,
        editable: false,
        name: 'method',
        listeners: {
            afterrender: function () {
                this.select(this.getStore().getAt(0));
            }
        }
    });

    var attributeCombo = Ext.create('Ext.form.field.ComboBox', {
//        labelAlign: 'top',
        labelWidth: 200,
        fieldLabel: 'Select edge weight',
        store: this.attributeStore,
        allowBlank: false,
        editable: false,
        displayField: 'name',
        valueField: 'name',
        queryMode: 'local',
        forceSelection: true,
        hidden: true,
        listeners: {
            afterrender: function () {
                this.select(this.getStore().getAt(0));
            },
            change: function (field, e) {
                var value = field.getValue();
                if (value != null) {
                    _this.attributeNameSelected = value;
                }
            }
        }
    });


    var directedItems = [
        {
            id: this.id + 'undirected',
            inputValue: 'F',
            boxLabel: 'No',
            checked: true
        },
        {
            id: this.id + 'directed',
            inputValue: 'T',
            boxLabel: 'Yes',
            checked: false
        }
    ];
    this.directedRadioGroup = Ext.create('Ext.form.RadioGroup', {
        labelWidth: 200,
        fieldLabel: 'Consider network as directed',
        defaults: {
            name: 'directed'
        },
        items: directedItems
    });

    var weightedItems = [
        {
            id: this.id + 'unweighted',
            inputValue: 'F',
            boxLabel: 'No',
            checked: true
        },
        {
            id: this.id + 'weighted',
            inputValue: 'T',
            boxLabel: 'Yes',
            checked: false
        }

    ];
    this.weightedRadioGroup = Ext.create('Ext.form.RadioGroup', {
        labelWidth: 200,
        fieldLabel: 'Consider network as weighted',
        defaults: {
            name: 'weighted'
        },
        items: weightedItems,
        listeners: {
            change: function (radiogroup, newValue, oldValue, eOpts) {
                console.log(newValue);
                if (newValue['weighted'] === 'T') {
                    attributeCombo.show();
                } else {
                    attributeCombo.hide();
                }
            }
        }
    });

    this.progress = Ext.create('Ext.ProgressBar', {
        text: 'Click run to start the analysis...',
        border: 1,
        flex: 1,
        margin: '0 10 0 0'
    });

    this.results = Ext.create('Ext.Component', {
        margin: '20 0 0 0',
        html: ''
    });


    this.applyButton = Ext.create('Ext.button.Button', {
        xtype: 'button',
        text: 'Apply as color',
        enableToggle: true,
        pressed: false,
        toggleHandler: function () {
            if (this.pressed) {
                _this.cellMaps.configuration.vertexColorAttributeWidget.applyDirectVisualSet("Community color", "String");
            } else {
                _this.cellMaps.configuration.vertexColorAttributeWidget.removeVisualSet();
            }
        }
    });

    this.resultContainer = Ext.create('Ext.panel.Panel', {
        hidden: true,
        title: 'Results',
        header: {
            baseCls: 'header-form'
        },
        border: false,
        padding: 10,
        bodyPadding: 10,
        layout: {
            type: 'vbox',
            align: 'center'
        },
        items: [
            {
                xtype: 'box',
                html: 'Community dectection results are available as node attribute <span style="font-weight: bold">Community id</span>.'
            },
            {
                xtype: 'button',
                text: 'Show node attributes',
                handler: function () {
                    _this.cellMaps.vertexAttributeEditWidget.show();
                }
            },
            {
                xtype: 'box',
                margin: '20 0 0 0',
                align: 'center',
                html: 'A color has been assigned to the top communities.'
            },
            this.applyButton,
            this.results
        ]
    });

    this.window = Ext.create('Ext.window.Window', {
        title: "Network analysis: Communities structure detection",
        closable: false,
        minimizable: true,
        collapsible: true,
        layout: 'fit',
        items: {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            width: 500,
            border: 0,
            items: [
                {
                    xtype: 'form',
                    title: 'Input parameters',
                    header: {
                        baseCls: 'header-form'
                    },
                    border: 0,
                    flex: 1,
                    padding: 10,
                    bodyPadding: 10,
                    items: [
                        this.methodCombo,
                        this.directedRadioGroup,
                        this.weightedRadioGroup,
                        attributeCombo
                    ]
                },
                this.resultContainer
            ],
            bbar: {
                defaults: {
                    width: 100
                },
                items: [
                    this.progress,
                    {
                        text: 'Close',
                        handler: function (bt) {
                            bt.up('window').hide();
                        }
                    },
                    {
                        text: 'Run',
                        handler: function () {
                            _this.applyButton.toggle(false);
                            _this.retrieveData();
                        }
                    }
                ]
            }
        },


        listeners: {
            minimize: function () {
                this.hide();
            }
        }
    });
    /**/
};

CommunitiesStructureDetectionPlugin.prototype.retrieveData = function () {
    var _this = this;

    _this.resultContainer.hide()

    this.progress.updateProgress(0.1, 'Requesting data');

    var sif;
    if (this.weightedRadioGroup.getValue().weighted === 'T') {
        sif = this.cellMaps.networkViewer.getAsSIFCustomRelation('\t', this.attributeNameSelected);
    } else {
        sif = this.cellMaps.networkViewer.getAsSIF();
    }
    console.log(sif)

    var data = {
        sif: sif,
        directed: this.directedRadioGroup.getValue().directed,
        weighted: this.weightedRadioGroup.getValue().weighted,
        method: this.methodCombo.getValue()
    }


    $.ajax({
        type: "POST",
        url: OpencgaManager.getUtilsUrl() + '/network/community',
        data: data,
        dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
        success: function (data, textStatus, jqXHR) {
            if (typeof data.response.error === 'undefined') {
                var attributeNetworkDataAdapter = new AttributeNetworkDataAdapter({
                    dataSource: new StringDataSource(data.response.attributes),
                    handlers: {
                        'data:load': function (event) {
                            _this.progress.updateProgress(0.4, 'processing data');
                            var json = event.sender.getAttributesJSON();
                            json.attributes[1].name = "Community id";
                            json.attributes[2].name = "Community color";
                            console.log(json)
                            _this.progress.updateProgress(0.7, 'creating attributes');
                            _this.cellMaps.networkViewer.importVertexWithAttributes({content: json});
                            _this.progress.updateProgress(1, 'Community structure detected successfully');
                            _this.resultContainer.show()
                        }
                    }
                });
                _this.results.update(Utils.htmlTable(data.response.results));
            } else {
                _this.progress.updateProgress(0, 'Error');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('error')
        }
    });
};

//
//console.log('success')
//console.log(data.response);
//if (typeof data.response.error === 'undefined') {
//    var attributesDataAdapter = new AttributesDataAdapter({
//        dataSource: new StringDataSource(data.response.local),
//        handlers: {
//            'data:load': function (event) {
//                _this.progress.updateProgress(0.4, 'processing data');
//                var json = event.sender.getAttributesJSON();
//                json.attributes[1].name = "Degree";
//                json.attributes[2].name = "Betweenness";
//                json.attributes[3].name = "Closeness centrality";
//                json.attributes[4].name = "Clustering coefficient";
//                console.log(json)
//                _this.progress.updateProgress(0.7, 'creating attributes');
//                _this.cellMaps.networkViewer.importVertexWithAttributes({content: json});
//                _this.progress.updateProgress(1, 'Topology information retrieved successfully');
//                _this.resultContainer.show()
//            }
//        }
//    });
//    _this.globalResult.update(Utils.htmlTable('Global result', data.response.global));
//} else {
//    _this.progress.updateProgress(0, data.response.error);
//}