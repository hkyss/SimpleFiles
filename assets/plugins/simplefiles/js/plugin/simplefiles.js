var sfHelper = {};
(function($){
    sfHelper = {
        sourceRow: {},
        targetRow: {},
        point: '',
        init: function() {
            var workspace = $('#SimpleFiles');

            workspace.append('<div class="js-fileapi-wrapper"><div class="btn-left"><a href="javascript:void(0)" id="sfUploadBtn"></a><a href="javascript:;" id="sfAddBtn" onclick="GetAllFiles(event);"></a></div><table id="sfGrid" width="100%"></table><div id="dlg" class="easyui-dialog" title="File catalog" style="width:600px;padding:10px"><ul id="tt" class="easyui-tree" style="height:400px;overflow:scroll;border-bottom: 1px solid #D4D4D4;" checkbox="true"></ul><div style="margin-top:10px;display:flex;justify-content:flex-end;"><a href="javascript:;" id="sfSaveBtn" onclick="SaveFiles(event);"></a></div></div></div>');

            $('#dlg').dialog({
                closed: true,
            });

            $('#sfAddBtn').linkbutton({
                iconCls:'fa fa-file-o',
                text: 'Добавить'
            });
            $('#sfSaveBtn').linkbutton({
                iconCls:'fa fa-save',
                text: 'Сохранить'
            });

            var uploaderOptions = {
                workspace:'#SimpleFiles',
                dndArea:'.js-fileapi-wrapper',
                uploadBtn:'#sfUploadBtn',
                url:sfConfig.url,
                imageAutoOrientation: false,
                data: {
                    mode:'upload',
                    sf_rid:sfConfig.rid
                },
                chunkSize: .5 * FileAPI.MB,
                chunkUploadRetry: 1,
                filterFn:function(file){
                    return sfConfig.allowedFiles.test(file.name.split('.').pop().toLowerCase());
                },
                completeCallback:function(){
                    $('#sfGrid').edatagrid('reload');
                }
            };
            var sfUploader = new EUIUploader(uploaderOptions);
            var sfGrid = new EUIGrid({
                url: sfConfig.url+'',
                destroyUrl: sfConfig.url+'?mode=remove&sf_rid='+sfConfig.rid,
                updateUrl: sfConfig.url+'?mode=edit',
                idField: 'sf_id',
                indexField: 'sf_index',
                sortName: 'sf_index',
                sortOrder: 'DESC',
                parentField: 'sf_rid',
                rid: sfConfig.rid,
                queryParams: {sf_rid: sfConfig.rid},
                columns: sfGridColumns
            }, '#sfGrid');
            var pager = sfGrid.datagrid('getPager');    // get the pager of datagrid
            pager.pagination({
                buttons:[
                    {
                        iconCls:'fa fa-trash fa-lg btn-extra',
                        handler:function(){sfHelper.deleteAll();}
                    }
                ]
            });
            $('.btn-extra').parent().parent().hide();
        },
        destroyWindow: function(wnd) {
            wnd.window('destroy',true);
            $('.window-shadow,.window-mask').remove();
            $('body').css('overflow','auto');
        },
        escape: function(str) {
            return str
                .replace(/&/g, '&amp;')
                .replace(/>/g, '&gt;')
                .replace(/</g, '&lt;')
                .replace(/"/g, '&quot;');
        },
        saverow: function (index) {
            $('#sfGrid').edatagrid('endEdit', index);
        },
        cancelrow: function (index) {
            $('#sfGrid').edatagrid('cancelEdit', index);
        },
        deleteRow: function (index) {
            $('#sfGrid').edatagrid('destroyRow', index);
        },
        getSelected: function() {
            var ids = [];
            var rows = $('#sfGrid').edatagrid('getChecked');
            if (rows.length) {
                $.each(rows, function(i, row) {
                    ids.push(row.sf_id);
                });
            }
            return ids;
        },
        deleteAll: function() {
            var ids = this.getSelected();
            $.messager.confirm(_sfLang['delete'],_sfLang['are_you_sure_to_delete_many'],function(r){
                if (r && ids.length > 0){
                    $.post(
                        sfConfig.url+'?mode=remove',
                        {
                            ids:ids.join(),
                            sf_rid:sfConfig.rid
                        },
                        function(response) {
                            if(response.success) {
                                $('#sfGrid').edatagrid('reload');
                            } else {
                                $.messager.alert(_sfLang['error'],_sfLang['cannot_delete']);
                            }
                        },'json'
                    ).fail(function(xhr) {
                        $.messager.alert(_sfLang['error'],_sfLang['server_error']+xhr.status+' '+xhr.statusText,'error');
                    });
                }
            });
        }
    }
})(jQuery);

function GetAllFiles(e) {
    (function($){
        $('#sfGrid').edatagrid('reload');

        $.ajax({
            type: 'get',
            url: '/simplefiles-getfilelist',
            dataType: 'json',
            success: function (data) {
                $('#tt').tree({
                    url:'/assets/plugins/simplefiles/files.json',
                    animate:true,
                    onlyLeafCheck:true
                });

                $('#dlg').dialog({
                    closed: false
                });
            }
        });

        e.preventDefault();
    })(jQuery);
}

function SaveFiles(e) {
    (function($){
        let params = window
            .location
            .search
            .replace('?','')
            .split('&')
            .reduce(
                function(p,e){
                    var a = e.split('=');
                    p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
                    return p;
                },
                {}
            );

        let checked = $('#tt').tree('getChecked');

        $.ajax({
            type: 'get',
            url: '/simplefiles-savefilelist',
            data: {
                files: JSON.stringify(checked),
                parameters: params
            },
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                $('#dlg').dialog({
                    closed: true
                });

                $('#sfGrid').edatagrid('reload');
            }
        });

        e.preventDefault();
    })(jQuery);
}