class Uploader extends React.Component {
  constructor() {
    super();
    this.state = {
      status: 'empty',
      progress: 0,
      inputValue: {},
      filename: ''
    };
  }

  componentWillMount() {
    this.setDimension();
    this.setFilenamePosition();

    var defaultAttributeName = this.props.object + "[" + this.props.attribute + "]";
    this.attributeName = !this.props.customAttributeName ? defaultAttributeName : this.props.customAttributeName;
    this.attributeId = this.props.object + "_" + this.props.attribute;

    this.isFileField = this.props.isFileField

    var actualFile = this.props.previewUrl;
    if (actualFile && !this.isFileField) {
      this.showPreview(actualFile);
    }

    if (this.isFileField) {
      this.setFilename(actualFile);
    }

  }

  componentDidMount() {
    var element = ReactDOM.findDOMNode(this.refs.fmUploaderContainer);

    $(document).bind('dragover', this.dragOverDocument.bind(this));
    $(element).bind('dragover', this.dragOver.bind(this));
    $(element).bind('dragleave', this.dragLeave.bind(this));

    $(element).fileupload({
      url: this.props.url,
      type: 'POST',
      formData: this.getFormData.bind(this),
      add: this.add.bind(this),
      progress: this.progress.bind(this),
      done: this.done.bind(this)
    });

    var previewStatus = (this.props.previewUrl) ? 'filled' : 'empty';
    this.setState({ status: previewStatus });
  }

  componentDidUpdate() {
    if (this.state.status == 'loading') {
      this.disableSubmitButton()
    } else if(this.state.status == 'filled'){
      this.enableSubmitButton()
    }
  }

  disableSubmitButton() {
    var submitButton = $("input:submit[name='commit']")
    submitButton.prop("disabled", true);
  }

  enableSubmitButton() {
    var submitButton = $("input:submit[name='commit']")
    submitButton.prop("disabled", false);
  }

  getFormData() {
    var result = [];

    Object.keys(this.props.fields).forEach(function(key) {
      result.push({name: key, value: this.props.fields[key]});
    }.bind(this));

    result.push({name: this.props.as, value: this.file});

    return result;
  }

  add(e, data) {
    this.setState({progress: 0, status: 'loading'});
    this.file = data.files[0];

    this.showPreview(this.file);

    data.submit();
  }

  showPreview(file) {
    loadImage(file, this.appendPreview.bind(this), {
      maxWidth: this.previewWidth,
      maxHeight: this.previewHeight,
      minWidth: 100,
      minHeight: 100,
      canvas: true,
      crop: true,
      orientation: true
    });
  }

  progress(e, data) {
    var progress = parseInt(data.loaded / data.total * 100, 10);
    this.setState({ progress: progress });
  }

  appendPreview(image) {
    var element = ReactDOM.findDOMNode(this.refs.preview);

    $(element).html('');
    $(image).hide();
    $(element).append($(image).fadeIn());

  }

  done(e, data) {
    this.setState({
      status: 'filled',
      inputValue: {
        "id": this.props.id || data.result.id,
        "filename": this.file.name,
        "content_type": this.file.type,
        "size": this.file.size
      }
    });

    if (this.isFileField) {
      this.setFilename(this.state.inputValue);
    }

  }

  dragOverDocument(event) {
    if (this.state.status != 'dragenter') {
      this.setState({ status: 'dragover' });
    }
  }

  dragOver(event) {
    this.setState({ status: 'dragenter' });
  }

  dragLeave(event) {
    this.setState({ status: 'dragover' });
  }

  setDimension() {
    var previewSize = this.props.previewSize;
    var defaultDimension = {width: '400px', height: '200px'};

    this.uploaderDimension = _.isEmpty(previewSize) ? defaultDimension : previewSize;

    if (_.isEmpty(previewSize)){

      this.uploaderDimension = defaultDimension;
      this.previewHeight = parseInt(defaultDimension.height);
      this.previewWidth = parseInt(defaultDimension.width);

    } else {

      this.previewHeight = parseInt(previewSize.height);
      this.previewWidth = parseInt(previewSize.width);
      this.uploaderDimension = previewSize;

      if (previewSize.width == '100%') {
        var container = $('.fm-uploader-wrapper')[0];
        this.previewWidth = parseInt(container.offsetWidth);
      }

    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.state, nextState);
  }

  setFilename(actualFile){
    var fileUrl = actualFile;
    var filename = fileUrl.substr(fileUrl.lastIndexOf('/') + 1);
    var extension = filename.substr(filename.lastIndexOf('.') + 1);

    if(filename.length > 15) filename = filename.substring(0,15) + '...';

    this.setState({filename: filename});
  }

  setFilenamePosition(){
    this.filenamePosition = {top: (this.previewHeight / 3) + 'px'}
  }

  render () {
    var uploaderClasses = classNames('fm-uploader', {
      'fm-uploader__img--empty': this.state.status == 'empty',
      'fm-uploader__img--dragover': this.state.status == 'dragover',
      'fm-uploader__img--dragenter': this.state.status == 'dragenter',
      'fm-uploader__img--loading': this.state.status == 'loading',
      'fm-uploader__img--filled': this.state.status == 'filled'
    });

    var filename;

    if (this.isFileField && this.state.status == 'filled') {
      filename = <span className="fm-uploader__filename" style={this.filenamePosition}>{this.state.filename}</span>
    }

    var uploaderActionClasses = classNames('fm-uploader__actions', {
      'fm-uploader__actions--empty': this.state.status == 'empty',
      'fm-uploader__actions--filled': this.state.status == 'filled',
      'hide': this.state.status == 'loading'
    });

    var addNewButtonClasses = classNames('actions__btn-add');

    var addNewMessage = this.state.status == 'empty' ? 'Adicionar imagem' : 'Nova imagem';

    return(
    <div className={uploaderClasses} style={this.uploaderDimension} ref="fmUploaderContainer">

      {filename}

      <input value={JSON.stringify(this.state.inputValue)} type="hidden" name={this.attributeName} />

      <div className={uploaderActionClasses}>

        <div className="actions__btn-remove">
          <a className="actions__caption">Remover imagem</a>
        </div>

        <input type="file" id={this.attributeId} ref="uploaderInput"/>
        <label className={addNewButtonClasses} htmlFor={this.attributeId}>
          <a className="actions__caption">{addNewMessage}</a>
        </label>

        <div className="actions__btn-edit">
          <a className="actions__caption">Editar imagem</a>
        </div>

      </div>

      <div className="fm-uploader__preview" ref="preview"></div>
      <div className="fm-uploader__drag-text">
        <span>Arraste a imagem aqui</span>
      </div>

      <div className="fm-uploader__loader-wrapper" data-progress={this.state.progress}>
        <svg viewBox="0 0 32 32" className="fm-uploader__loader">
          <circle fillOpacity={0} r="50%" cx="50%" cy="50%" style={{strokeDasharray:this.state.progress + ' 100'}} />
        </svg>
        <div className="fm-uploader__loader-text">{this.state.progress}%</div>
      </div>

    </div>
    );
  }
}
