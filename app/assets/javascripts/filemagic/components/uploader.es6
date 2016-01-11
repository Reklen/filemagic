class Uploader extends React.Component {
  constructor() {
    super();
    this.state = {
      status: 'empty',
      progress: 0,
      inputValue: {}
    };
  }

  componentWillMount() {
    this.setDimension();

    this.attributeName = this.props.object + "[" + this.props.attribute + "]";
    this.attributeId = this.props.object + "_" + this.props.attribute;

    var actualFile = this.props.previewUrl;
    if (actualFile) {
      this.showPreview(actualFile);
    }
  }

  componentDidMount() {
    var element = React.findDOMNode(this.refs.uploader);

    $(document).bind('dragover', this.dragOverDocument.bind(this));
    $(element).bind('dragover', this.dragOver.bind(this));
    $(element).bind('dragleave', this.dragOut.bind(this));

    $(element).fileupload({
      url: this.props.url,
      type: 'POST',
      formData: this.getFormData.bind(this),
      add: this.add.bind(this),
      progress: this.progress.bind(this),
      done: this.done.bind(this)
    });

    var previewStatus = (this.props.previewUrl) ? 'done' : 'loading';
    this.setState({ status: previewStatus });
  }

  componentDidUpdate() {
    var submitButton = $("input:submit[name='commit']")

    if (this.state.status == 'done' || this.state.status == 'empty'){
      submitButton.addClass("btn-done")
      submitButton.removeClass("btn-disabled")
    } else {
      submitButton.addClass("btn-disabled")
      submitButton.removeClass("btn-done")
    }

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

    this.showPreview(this.file)

    data.submit();
  }

  showPreview(file) {
    // TODO: Think about some other way to validate if is an image, when loading image for editing
    //       when editing model, file is not loaded to data, as it does when selecting an image on input button
    // if (file.type && file.type.match(/gif|jpe?g|png/)) {
      loadImage(file, this.appendPreview.bind(this), {
        maxWidth: this.previewWidth,
        maxHeight: this.previewHeight,
        minWidth: 100,
        minHeight: 100,
        canvas: true,
        crop: true,
        orientation: true
      });
    // }
  }

  progress(e, data) {
    var progress = parseInt(data.loaded / data.total * 100, 10);
    this.setState({ progress: progress });
  }

  appendPreview(image) {
    var element = React.findDOMNode(this.refs.preview);

    $(element).html('');
    $(image).hide();
    $(element).append($(image).fadeIn());

  }

  done(e, data) {
    this.setState({
      status: 'done',
      inputValue: {
        "id": this.props.id || data.result.id,
        "filename": this.file.name,
        "content_type": this.file.type,
        "size": this.file.size
      }
    });
  }

  dragOverDocument(event) {
    if (this.state.status != 'dragenter') {
      this.setState({ status: 'dragover' });
    }
  }

  dragOver(event) {
    this.setState({ status: 'dragenter' });
  }

  dragOut(event) {
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
        var container = $('.js-component.filemagic-container')[0];
        this.previewWidth = parseInt(container.offsetWidth);
      }

    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.state, nextState);
  }

  render () {
    var uploaderClasses = classNames('filemagic-uploader', 'editor-img', 'editor-img--home_banner', {
      'editor-img--empty': this.state.status == 'empty',
      'editor-img--drag': this.state.status == 'dragover',
      'editor-img--dragenter': this.state.status == 'dragenter',
      'editor-img--loading': this.state.status == 'loading',
      'editor-img--done': this.state.status == 'done'
    });

    var msgClasses = classNames('editor-element-text', {
      'show': this.state.status == 'dragover' || this.state.status == 'dragenter'
    });

    var previewClasses = classNames('preview', {
      'show': this.state.status == 'loading'
    });

    var loaderWrapperClasses = classNames('loader-wrapper', {
      'show': this.state.status == 'loading'
    });

    var loaderTextWrapperClasses = classNames('editor-element-text loader-text', {
      'show': this.state.status == 'loading'
    });

    return(
    <div className={uploaderClasses} style={this.uploaderDimension}>
      <input value={JSON.stringify(this.state.inputValue)} type="hidden" name={this.attributeName} />
      <input type="file" id={this.attributeId} ref="uploader" />

      <div className={previewClasses} ref="preview"></div>
      <div className={msgClasses}>Arraste a imagem aqui</div>

      <div className={loaderWrapperClasses}>
        <div className="loader-border">
          <div className="loader" data-progress={this.state.progress}>
            <div className="loader-element loader-spinner"></div>
            <div className="loader-element loader-filler"></div>
          </div>
        </div>
      </div>

      <div className={loaderTextWrapperClasses}>{this.state.progress}%</div>
    </div>
    );
  }
}