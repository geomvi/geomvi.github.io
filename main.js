
$(document).ready(function() {
	var options = {
		slidesToScroll: 1,
		slidesToShow: 3,
		loop: true,
		infinite: false,
		autoplay: false,
		autoplaySpeed: 3000,
	}

	var options1 = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: false,
		autoplay: false,
		autoplaySpeed: 3000,
	}

	var options2 = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: false,
		autoplay: false,
		autoplaySpeed: 3000,
	}

	// Initialize all div with carousel class
	// var carousels = bulmaCarousel.attach('.carousel', options);
	// var carousels = bulmaCarousel.attach('.carousel1', options1);
	var carousels = bulmaCarousel.attach('.carousel2', options2);

	// Loop on each carousel initialized
	for(var i = 0; i < carousels.length; i++) {
		// Add listener to  event
		carousels[i].on('before:show', state => {
			console.log(state);
		});
	}

	// Access to bulmaCarousel instance of an element
	var element = document.querySelector('#my-element');
	if (element && element.bulmaCarousel) {
		// bulmaCarousel instance is available as element.bulmaCarousel
		element.bulmaCarousel.on('before-show', function(state) {
			console.log(state);
		});
	}

	/*var player = document.getElementById('interpolation-video');
	player.addEventListener('loadedmetadata', function() {
		$('#interpolation-slider').on('input', function(event) {
			console.log(this.value, player.duration);
			player.currentTime = player.duration / 100 * this.value;
		})
	}, false);*/
	// preloadInterpolationImages();

	// $('#interpolation-slider').on('input', function(event) {
	// 	setInterpolationImage(this.value);
	// });
	// setInterpolationImage(0);
	// $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

	// bulmaSlider.attach();

})

var spinnerf_methods = ['input', 'spinnerf', 'infusion', 'mvipnerf', 'maldnerf', 'ours']
// var real_methods = ['geogpt','lookout','sde'];
// var mp3d_methods = ['lookout','sde'];
class Sample_viewer{
	constructor(prefix,max_idx,n_scenes,variants,methods){
		this.variants = variants;
		this.n_scenes = n_scenes;
		this.prefix = prefix;
		this.max_idx = max_idx;
		this.cur_frame = 0;
		this.cur_sample = 0;
		this.variant = variants[0];
		this.base_im = '0000';
		this.need_stop_anim = false;
		this.interval_id = null;
		this.anim_dir = 1;
		this.methods = methods;
		for (let i=0;i<this.n_scenes;i++){
			document.getElementById(`${this.prefix}-scene-selector`).innerHTML += `<div onclick="${this.prefix}_viewer.change_scene(\'${i.toString().padStart(4,0)}\');" class="col-1" style="padding:0em;margin-left:0.5em;"> <img style="border-radius:1em;" class=selectable src="assets/icons/${this.prefix}/${i.toString().padStart(4,0)}.webp"> </div>`;
		}
	}
	change_scene(idx){
		this.base_im = idx;
		this.update_ims();
	}
	change_variant(name){
		this.variant = name;
		if (this.variants){
			for (let nn of this.variants){
				document.getElementById(`${nn}_selector`).style.backgroundColor = '';
				document.getElementById(`${nn}_selector`).style.borderRadius = '1em';
			}
			document.getElementById(`${name}_selector`).style.backgroundColor = 'lightgrey';
			document.getElementById(`${name}_selector`).style.borderRadius = '1em';
		}
		this.update_ims();
	}
	change_frame(idx){
		this.stop_anim();
		this.cur_frame = parseInt(idx);
		this.update_ims();
	}
	change_sample(idx){
		//this.stop_anim();
		this.cur_sample = idx;
		this.update_ims();
		for (let i=0;i<3;i++){
			document.getElementById(`${this.prefix}_sample_selector_${i+1}`).style.backgroundColor = 'rgb(240,240,240)';
		}
		document.getElementById(`${this.prefix}_sample_selector_${idx+1}`).style.backgroundColor = 'lightgrey';
	}
	update_ims(){
		for (let method of this.methods){
			// if (this.cur_frame == 0){
				// document.getElementById(`${this.prefix}-${method}`).src = `assets/individual-frames/initial-frames/${this.prefix}/${this.base_im}.webp`;
			// }else{
				let frame_padded = this.cur_frame.toString().padStart(4,0);
				// let sample_padded = this.cur_sample.toString().padStart(2,0);
				console.log(this.prefix);
				console.log(this.variant);
				document.getElementById(`${this.prefix}-${method}`).src = `assets/individual-frames/${this.variant}/${this.base_im}/${method}/${frame_padded}.webp`;
			// }
		}
	}
	next_frame(){
		this.cur_frame += this.anim_dir;
		if (this.cur_frame >= this.max_idx) {this.anim_dir=-1;}
		if (this.cur_frame <= 0) {this.anim_dir=1;}
		document.getElementById(`${this.prefix}_frame_control`).value = this.cur_frame;
		this.update_ims();
	}
	cycle_frames(delay){
		this.stop_anim();
		this.interval_id = setInterval(function() {
			this.next_frame();
		}.bind(this), delay);
		this.update_ims();
	}
	stop_anim(){
		if (this.interval_id){clearInterval(this.interval_id);}
		this.interval_id = null;
	}
};

class TSED_viewer{
	constructor(){
		this.can = document.getElementById('epipolar-canvas');
		this.ctx = this.can.getContext("2d");
		this.can.addEventListener('mousedown', function(e) {
			this.user_select_point(e);
		}.bind(this))
		this.display_size = 512;
		this.point_colours = ['#45ff17','#fc00ec'];
		this.sed_colours = ['#F92600','#00aef9'];	
		this.points = [null,null];
		this.im_ids = [0,1];
		this.spec_string = '{"focal_y": 0.8774175047874451, "poses": [[[1.0, 0, 0.0, 0.0], [0, 1, 0, 0], [-0.0, 0, 1.0, 2.0], [0, 0, 0, 1]], [[0.984807753012208, 0, 0.17364817766693033, 0.34729635533386066], [0, 1, 0, 0], [-0.17364817766693033, 0, 0.984807753012208, 1.969615506024416], [0, 0, 0, 1]], [[0.9396926207859084, 0, 0.3420201433256687, 0.6840402866513374], [0, 1, 0, 0], [-0.3420201433256687, 0, 0.9396926207859084, 1.8793852415718169], [0, 0, 0, 1]], [[0.8660254037844387, 0, 0.49999999999999994, 0.9999999999999999], [0, 1, 0, 0], [-0.49999999999999994, 0, 0.8660254037844387, 1.7320508075688774], [0, 0, 0, 1]], [[0.766044443118978, 0, 0.6427876096865393, 1.2855752193730785], [0, 1, 0, 0], [-0.6427876096865393, 0, 0.766044443118978, 1.532088886237956], [0, 0, 0, 1]], [[0.6427876096865394, 0, 0.766044443118978, 1.532088886237956], [0, 1, 0, 0], [-0.766044443118978, 0, 0.6427876096865394, 1.2855752193730787], [0, 0, 0, 1]], [[0.5000000000000001, 0, 0.8660254037844386, 1.7320508075688772], [0, 1, 0, 0], [-0.8660254037844386, 0, 0.5000000000000001, 1.0000000000000002], [0, 0, 0, 1]], [[0.3420201433256688, 0, 0.9396926207859083, 1.8793852415718166], [0, 1, 0, 0], [-0.9396926207859083, 0, 0.3420201433256688, 0.6840402866513376], [0, 0, 0, 1]], [[0.17364817766693041, 0, 0.984807753012208, 1.969615506024416], [0, 1, 0, 0], [-0.984807753012208, 0, 0.17364817766693041, 0.34729635533386083], [0, 0, 0, 1]], [[6.123233995736766e-17, 0, 1.0, 2.0], [0, 1, 0, 0], [-1.0, 0, 6.123233995736766e-17, 1.2246467991473532e-16], [0, 0, 0, 1]]], "dependencies": [null, [0], [1], [2], [3], [4], [5], [6], [7], [8]], "generation_order": [1, 2, 3, 4, 5, 6, 7, 8, 9]}';
		this.spec = JSON.parse(this.spec_string);
		this.distances = [null,null];
		this.display = document.getElementById('sed-display');
		this.display.innerHTML = 'Select correspondences on each image to compute the SED. <br> <img src="assets/tsed/svg/sed_coloured.svg" style="height:3em;visibility:hidden">';
	};
	get_fundamental_matrix(idx1,idx2){
		// unpack poses, intrinsics
		// my poses
		// let poses = [
		// 	[
		// 		[0.07845910638570786, 0.553857684135437, -0.8289064764976501, -0.2197655588388443],
		// 		[-0.9969174265861511, 0.04358954355120659, -0.06523635983467102, 0.045665442943573],
		// 		[-3.725290298461914e-09, 0.8314696550369263, 0.5555703043937683, -0.0888991504907608],
		// 		[0.0, 0.0, 0.0, 1.0],
		// 	], [
		// 		[-0.30901700258255005, 0.5283787250518799, -0.7907745838165283, -0.24645784497261047],
		// 		[-0.9510565996170044, -0.17168065905570984, 0.25693824887275696, -0.1798567771911621],
		// 		[-4.470348358154297e-08, 0.8314695954322815, 0.5555702447891235, -0.08889912068843842],
		// 		[0.0, 0.0, 0.0, 1.0],
		// 	], [
		// 		[-0.07845909148454666, 0.4409253001213074, -0.8941078782081604, -0.17412443459033966],
		// 		[-0.9969173073768616, -0.034701574593782425, 0.07036782056093216, -0.04925747960805893],
		// 		[-3.725290298461914e-09, 0.8968727588653564, 0.44228869676589966, -0.009602092206478119],
		// 		[0.0, 0.0, 0.0, 1.0],
		// 	],
		// ]
		// nerfstudio poses
		// let poses = [[[-0.9969174265861511, -0.04358954355120659, 0.06523635983467102, 0.045665442943573], [0.07845910638570786, -0.553857684135437, 0.8289064764976501, -0.2197655588388443], [3.725290298461914e-09, 0.8314696550369263, 0.5555703043937683, 0.0888991504907608], [0.0, 0.0, 0.0, 1.0]], [[-0.9510565996170044, 0.17168065905570984, -0.25693824887275696, -0.1798568069934845], [-0.30901700258255005, -0.5283787250518799, 0.7907745838165283, -0.24645781517028809], [2.9802322387695312e-08, 0.8314695954322815, 0.5555702447891235, 0.088899165391922], [0.0, 0.0, 0.0, 1.0]], [[-0.9969173073768616, 0.034701574593782425, -0.07036782056093216, -0.04925747960805893], [-0.07845909148454666, -0.4409253001213074, 0.8941078782081604, -0.17412443459033966], [3.725290298461914e-09, 0.8968727588653564, 0.44228869676589966, 0.009602092206478119], [0.0, 0.0, 0.0, 1.0]]]
		// w2c
		// let poses = [[[0.07845909148454666, -0.9969172477722168, -3.08791658909513e-09, 0.06276727467775345], [0.5538576245307922, 0.04358953610062599, 0.8314695358276367, 0.19364523887634277], [-0.8289063572883606, -0.06523635238409042, 0.5555702447891235, -0.12979631125926971], [0.0, 0.0, 0.0, 1.0]], [[-0.30901697278022766, -0.9510564804077148, 0.0, -0.24721361696720123], [0.5283786654472351, -0.17168067395687103, 0.8314695954322815, 0.17326205968856812], [-0.7907746434211731, 0.25693821907043457, 0.5555702447891235, -0.09929078817367554], [0.0, 0.0, 0.0, 1.0]], [[-0.07845910638570786, -0.9969173669815063, 0.0, -0.06276728212833405], [0.440925270318985, -0.034701574593782425, 0.8968726992607117, 0.08367840945720673], [-0.89410799741745, 0.07036782056093216, 0.44228875637054443, -0.14797301590442657], [0.0, 0.0, 0.0, 1.0]]]
		// opengl
		// let poses = [[[0.07845910638570786, 0.553857684135437, -0.8289064764976501, -0.2197655588388443], [0.9969174265861511, -0.04358954355120659, 0.06523635983467102, -0.045665442943573], [3.725290298461914e-09, -0.8314696550369263, -0.5555703043937683, 0.0888991504907608], [0.0, 0.0, 0.0, 1.0]], [[-0.30901700258255005, 0.5283787250518799, -0.7907745838165283, -0.24645784497261047], [0.9510565996170044, 0.17168065905570984, -0.25693824887275696, 0.1798567771911621], [4.470348358154297e-08, -0.8314695954322815, -0.5555702447891235, 0.08889912068843842], [0.0, 0.0, 0.0, 1.0]], [[-0.07845909148454666, 0.4409253001213074, -0.8941078782081604, -0.17412443459033966], [0.9969173073768616, 0.034701574593782425, -0.07036782056093216, 0.04925747960805893], [3.725290298461914e-09, -0.8968727588653564, -0.44228869676589966, 0.009602092206478119], [0.0, 0.0, 0.0, 1.0]]]
		// blender
		let poses = [[[0.07845910638570786, -0.553857684135437, 0.8289064764976501, -0.2197655588388443], [-3.725290298461914e-09, -0.8314696550369263, -0.5555703043937683, -0.0888991504907608], [0.9969174265861511, 0.04358954355120659, -0.06523635983467102, -0.045665442943573], [0.0, 0.0, 0.0, 1.0]], [[-0.30901700258255005, -0.5283787250518799, 0.7907745838165283, -0.24645784497261047], [-4.470348358154297e-08, -0.8314695954322815, -0.5555702447891235, -0.08889912068843842], [0.9510565996170044, -0.17168065905570984, 0.25693824887275696, 0.1798567771911621], [0.0, 0.0, 0.0, 1.0]], [[-0.07845909148454666, -0.4409253001213074, 0.8941078782081604, -0.17412443459033966], [-3.725290298461914e-09, -0.8968727588653564, -0.44228869676589966, -0.009602092206478119], [0.9969173073768616, -0.034701574593782425, 0.07036782056093216, 0.04925747960805893], [0.0, 0.0, 0.0, 1.0]]]
		// let cam_world_1 = math.matrix(this.spec.poses[this.im_ids[idx1]]);
		// let cam_world_2 = math.matrix(this.spec.poses[this.im_ids[idx2]]);
		let cam_world_1 = math.matrix(poses[this.im_ids[idx1]]);
		let cam_world_2 = math.matrix(poses[this.im_ids[idx2]]);
		let focal_y = this.spec.focal_y;
		// let intrinsics_realestate = math.matrix([
		// 	[focal_y*256,0,128],
		// 	[0,focal_y*256,128],
		// 	[0,0,1],
		// ])
		let intrinsics_realestate = math.matrix([
			[548.9937744140625 / 2, 0.0, 256.0 / 2],
			[0.0, 548.9937744140625 / 2, 256.0 / 2],
			[0.0, 0.0, 1.0],
		])
		let blender_conversion = math.matrix([
			[1,0,0],
			[0,-1,0],
			[0,0,-1],
		])
		let intrinsics = math.multiply(intrinsics_realestate,blender_conversion)

		// convert poses to world relative to 1
		let cam_world_1_inv = math.inv(cam_world_1);
		let cam_world_rel_2 = math.multiply(cam_world_1_inv,cam_world_2);

		// get relative offset
		let T = [cam_world_rel_2.get([0,3]),cam_world_rel_2.get([1,3]),cam_world_rel_2.get([2,3])];

		// compute essential matrix
		let R = math.inv(cam_world_rel_2.subset(math.index([0,1,2],[0,1,2]))) // rotation to get relative world points to camera 2 coordinate
		let Tx = math.matrix([ // skew symmetric for crossproduct
			[0,-T[2],T[1]],
			[T[2],0,-T[0]],
			[-T[1],T[0],0],
		])
		let E = math.transpose(math.multiply(R,Tx))

		// compute fundamental matrix
		let intrinsics_inv = math.inv(intrinsics)
		let F = math.multiply(E,intrinsics_inv)
		F = math.multiply(math.transpose(intrinsics_inv),F)

		return F
	}
	solve_epipolar_intersects(p_1,F){
		let im_size = 256;
		let epipolar_norm = math.multiply(p_1,F);

		// base vectors for edges of image
		let l = math.transpose(math.matrix([[0,0,1]]));
		let r = math.transpose(math.matrix([[im_size,0,1]]));
		let t = math.transpose(math.matrix([[0,0,1]]));
		let b = math.transpose(math.matrix([[0,im_size,1]]));

		// solve intersects
		let l_int = -math.multiply(epipolar_norm,l)._data[0][0]/epipolar_norm._data[0][1];
		let r_int = -math.multiply(epipolar_norm,r)._data[0][0]/epipolar_norm._data[0][1];
		let t_int = -math.multiply(epipolar_norm,t)._data[0][0]/epipolar_norm._data[0][0];
		let b_int = -math.multiply(epipolar_norm,b)._data[0][0]/epipolar_norm._data[0][0];

		// enforce n interects
		let edges_in_range = [];
		if (0 <= l_int && l_int <= im_size){ edges_in_range.push(0)};
		if (0 <= r_int && r_int <= im_size){ edges_in_range.push(1)};
		if (0 <= t_int && t_int <= im_size){ edges_in_range.push(2)};
		if (0 <= b_int && b_int <= im_size){ edges_in_range.push(3)};
		if (edges_in_range.length != 2){
			return [0,0,0,0];
		}

		let out_vals = [];
		if (0 <= l_int && l_int <= im_size){ out_vals.push(0);out_vals.push(l_int);}
		if (0 <= r_int && r_int <= im_size){ out_vals.push(im_size);out_vals.push(r_int);}
		if (0 <= t_int && t_int <= im_size){ out_vals.push(t_int);out_vals.push(0);}
		if (0 <= b_int && b_int <= im_size){ out_vals.push(b_int);out_vals.push(im_size);}
		return out_vals
	};
	get_epipolar_dist(p_1,F,keypoint){
		let epipolar_norm = math.multiply(p_1,F);
		let norm_2d = math.matrix([[epipolar_norm._data[0][0],epipolar_norm._data[0][1],0]]);
		norm_2d = math.dotDivide(norm_2d,math.norm(norm_2d._data[0]));

		let s = -math.multiply(epipolar_norm,math.transpose(keypoint))._data[0][0] / math.multiply(epipolar_norm,math.transpose(norm_2d))._data[0][0];
		return [norm_2d, s];
	}
	draw_point(im_idx){
		let point = this.points[im_idx];
		if (!point){return;}
		let display_x = (point[0]+256*im_idx)*(this.display_size/256)
		let display_y = point[1]*(this.display_size/256)
		let radius = 5;
		this.ctx.beginPath();
		this.ctx.arc(display_x, display_y, radius, 0, 2 * Math.PI, false);
		this.ctx.lineWidth = 1.5;
		this.ctx.strokeStyle = this.point_colours[im_idx];
		this.ctx.stroke();

		let img = new Image();
		if (im_idx == 0){
			img.src = `assets/tsed/svg/p_coloured.svg`;
			var not_size = 10*1.3;
		}else{
			img.src='assets/tsed/svg/p\'_coloured.svg';
			var not_size = 15*1.3;
		};
		img.onload = function(){
			this.ctx.drawImage(img,display_x+5,display_y+5,not_size,not_size);
		}.bind(this);
	};
	draw_epipolar(im_idx){
		let point = this.points[im_idx];
		if (!point){return;}
		let fundamental = this.get_fundamental_matrix(im_idx,1-im_idx);
		let [x1,y1,x2,y2] = this.solve_epipolar_intersects(math.matrix([point.concat([1])]),fundamental);
		this.ctx.beginPath();
		this.ctx.strokeStyle = this.point_colours[im_idx];
		this.ctx.moveTo((x1+256*(1-im_idx))*(this.display_size/256), y1*(this.display_size/256));
		this.ctx.lineTo((x2+256*(1-im_idx))*(this.display_size/256), y2*(this.display_size/256));
		this.ctx.stroke();
	}
	draw_min(im_idx){
		let point = this.points[im_idx];
		let other_point = this.points[1-im_idx];
		if (!point){return;}
		if (!other_point){return;}
		let fundamental = this.get_fundamental_matrix(im_idx,1-im_idx);
		let [norm,s] = this.get_epipolar_dist(math.matrix([point.concat([1])]),fundamental,math.matrix([other_point.concat([1])]));
		let x1 = other_point[0]
		let y1 = other_point[1]
		let x2 = x1 + norm._data[0][0]*s;
		let y2 = y1 + norm._data[0][1]*s;
		this.ctx.beginPath();
		this.ctx.strokeStyle = this.sed_colours[1-im_idx];
		this.ctx.moveTo((x1+256*(1-im_idx))*(this.display_size/256), y1*(this.display_size/256));
		this.ctx.lineTo((x2+256*(1-im_idx))*(this.display_size/256), y2*(this.display_size/256));
		this.ctx.stroke();
		this.distances[1-im_idx] = Math.abs(s);
		this.update_display();

		if (Math.abs(s) < 20) return;
		let nx = (x1 + norm._data[0][0]*s/2 + 256*(1-im_idx))*(this.display_size/256);
		let ny = (y1 + norm._data[0][1]*s/2)*(this.display_size/256);
		let img = new Image();
		if (im_idx == 0){
			img.src = 'assets/tsed/svg/dist_2.svg';
		}else{
			img.src = 'assets/tsed/svg/dist_1.svg';
		};
		img.onload = function(){
			this.ctx.drawImage(img,nx+10,ny-12,100,25);
		}.bind(this);
	}
	update_display(){
		let sed = this.distances[0] + this.distances[1];
		this.display.innerHTML = `The symmetric epipolar distances is: ${(0.5*sed).toFixed(2)} pixels. <br> <img src="assets/tsed/svg/sed_coloured.svg" style='height:3em;'>`;
	};
	get_ims(){
		// let base_im = '0000'
		var img1 = `assets/individual-frames/few-view/0004/ours/${this.im_ids[0].toString().padStart(4,0)}.webp`;
		var img2 = `assets/individual-frames/few-view/0004/ours/${this.im_ids[1].toString().padStart(4,0)}.webp`;
		// if (this.im_ids[0] == 0){
			// var img1 = `assets/individual-frames/initial-frames/novel/${base_im}.webp`;
		// }else{
			// var img1 = `assets/individual-frames/orbit/${base_im}/sde/00/${this.im_ids[0].toString().padStart(4,0)}.webp`;
		// }
		// if (this.im_ids[1] == 0){
		// 	var img2 = `assets/individual-frames/initial-frames/novel/${base_im}.webp`;
		// }else{
		// 	var img2 = `assets/individual-frames/orbit/${base_im}/sde/00/${this.im_ids[1].toString().padStart(4,0)}.webp`;
		// }
		return [img1, img2];
	}
	redraw(){
		let img = new Image();
		let [im_path1, im_path2] = this.get_ims();
		img.src = im_path1;
		img.onload = function(){
			this.ctx.drawImage(img,0,0,512,512,0, 0,this.display_size,this.display_size);
			this.draw_point(0);
			this.draw_epipolar(1);
			this.draw_min(1);
		}.bind(this);
		let img2 = new Image();
		img2.src = im_path2;
		img2.onload = function(){
			this.ctx.drawImage(img2,0,0,512,512,512, 0,this.display_size,this.display_size);
			this.draw_point(1);
			this.draw_epipolar(0);
			this.draw_min(0);
		}.bind(this);
	};
	user_select_point(event){
		let rect = this.can.getBoundingClientRect()
		let im_x = (event.clientX - rect.left)*(512/rect.width)
		let im_y = (event.clientY - rect.top)*(256/rect.height)
		let im_idx = im_x > 256 ? 1:0;
		this.points[im_idx] = [];
		this.points[im_idx][0] = im_x - 256*im_idx;
		this.points[im_idx][1] = im_y;
		this.redraw();
	}
};

var spinnerf_viewer = null;
var novel_viewer = null;
var real_viewer = null;
var tsed_viewer = null;
var mp3d_novel_viewer = null;
var mp3d_real_viewer = null;

document.addEventListener("DOMContentLoaded", function() {
	// novel_viewer = new Sample_viewer('novel',9,4,['orbit','spin','hop'],real_methods);
	// real_viewer = new Sample_viewer('real',20,3,null,real_methods);
	// mp3d_novel_viewer = new Sample_viewer('mp3d_novel',9,3,['mp3d_orbit','mp3d_spin','mp3d_hop'],mp3d_methods);
	// mp3d_real_viewer = new Sample_viewer('mp3d_real',20,3,null,mp3d_methods);
	tsed_viewer = new TSED_viewer();
	// novel_viewer.change_frame(0);
	// novel_viewer.change_sample(0);
	// novel_viewer.change_variant('orbit');
	// real_viewer.change_frame(0);
	// real_viewer.change_sample(0);
	// real_viewer.change_variant('real');
	// mp3d_novel_viewer.change_frame(0);
	// mp3d_novel_viewer.change_sample(0);
	// mp3d_novel_viewer.change_variant('mp3d_orbit');
	// mp3d_real_viewer.change_frame(0);
	// mp3d_real_viewer.change_sample(0);
	// mp3d_real_viewer.change_variant('mp3d_real');
	spinnerf_viewer = new Sample_viewer('spinnerf',39,10,['spinnerf'],spinnerf_methods);
	spinnerf_viewer.change_frame(0);
	debug();
});

function debug(){
	tsed_viewer.redraw();
}
